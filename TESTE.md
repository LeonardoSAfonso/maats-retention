# Teste de Código - Cancelamento com Retenção Inteligente

Construa um fluxo de auto-atendimento de cancelamento de assinatura recorrente (streaming/SaaS genérico) com uma camada de IA que reduz o custo de retenção humana.

## Resumo

|             |                                                                                                            |
| ----------- | ---------------------------------------------------------------------------------------------------------- |
| **Formato** | Repositório Git seu (fork/branch a partir deste), histórico incremental.                                   |
| **Stack**   | Next.js + NestJS + PostgreSQL. Agente de IA por adapter mock determinístico (LLM real é opcional/stretch). |
| **IA**      | Permitida, com atribuição e defesa das decisões. Ver [Uso de IA](#uso-de-ia).                              |

**O que este repositório já entrega:** infraestrutura pronta (monorepo pnpm + turborepo configurado, Postgres no compose, conexão com o banco, `/health`, lint, typecheck, testes e build funcionando nos três pacotes, especificação em `packages/contracts/`).
**O que você constrói:** modelagem, migrations, seed, endpoints, agentes, regras de decisão, as telas do fluxo, os testes do caminho crítico e o CI.

Leia [`CONTEXT.md`](./CONTEXT.md) (linguagem ubíqua) e [`packages/contracts/README.md`](./packages/contracts/README.md) (contratos, cenários e fórmula da regra de alto valor) antes de implementar.

## Setup e verificação local

Requisitos: Node 22+, pnpm 11+, Docker.

```bash
pnpm install         # instala o workspace e liga os pacotes
cp .env.example .env # credenciais do Postgres para o docker compose
pnpm db:up           # Postgres em localhost:5432 (docker compose)
pnpm dev:backend     # API em http://localhost:3000  (GET /health)
pnpm dev:frontend    # UI em http://localhost:3001
pnpm verify          # lint + typecheck + testes dos três pacotes
```

`pnpm verify` **já passa hoje**. Use-o enquanto trabalha para perceber cedo quando alguma mudança quebrou o baseline. O turbo reaproveita o resultado das tarefas sem mudanças, então execuções repetidas costumam terminar rápido.

| Já pronto (não é o teste)                                                                                     | Você faz (é o teste)                                                                  |
| ------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| Monorepo pnpm + turborepo: build ordenado, cache, tarefas por pacote, tsconfig/ESLint/Prettier compartilhados | CI do repositório (workflow com lint + typecheck + testes)                            |
| `docker-compose.yml` com Postgres + healthcheck e volume                                                      | Serviços de API e frontend no compose, para `docker compose up` subir o fluxo inteiro |
| `DbModule` com `Pool` do `pg` injetável (`DB_POOL`) e `GET /health`                                           | Escolha e configuração de ORM/query builder, migrations, seed                         |
| NestJS com middleware de log, vitest (unit + e2e) e testes de exemplo verdes                                  | Módulos, DTOs, validação, logging estruturado, exception filter, regras e agentes     |
| Next.js 16 com Tailwind 4, shadcn/ui, tokens                                                                  | As 4 telas do fluxo, Server Actions, `<Suspense>`, acessibilidade                     |
| `@repo/contracts` compilado, consumível pelos dois apps e testado                                             | Mapear o domínio para o schema e usar os contratos                                    |

Você escolhe ORM, biblioteca de migração, lib de validação, estratégia de mock dos agentes e desenho das telas. Explique as decisões relevantes no README. O driver `pg` já está instalado, mas pode ser trocado.

`packages/contracts/` é a especificação e deve ficar intacto. Um teste do pacote falha se os limiares ou os cenários mudarem, e a alteração também aparece no `pnpm verify`. Se encontrar um problema na spec, registre-o no README e explique o motivo.

## Uso de IA

Copilot, Cursor, Claude Code, Codex e outras ferramentas estão liberados. A responsabilidade pelo resultado continua sendo sua.

- Você pode usar agente para gerar código, testes, migrations, UI e documentação. Revise o material, entenda as decisões e esteja preparado para defendê-las na conversa final.
- Registre no README como usou IA ou informe que não usou. Nenhuma das duas opções gera penalidade.
- A entrega reprova se você não souber explicar o próprio código, permitir que o agente altere `packages/contracts/` ou usar IA para contornar critérios, como trocar uma regra por número hardcoded, espalhar `any` ou mascarar um teste.
- O repositório não monitora uso de IA. A avaliação considera o código entregue e sua explicação na conversa final.

## O cenário

Quando um assinante inicia um cancelamento, um **Agente de Scoring** atribui um risco de churn (0.00 a 1.00) a partir dos dados do assinante e da assinatura. O risco representa a probabilidade de o assinante cancelar de fato. A partir do risco, o sistema decide entre três caminhos: cancelar direto, oferecer uma retenção automática, ou encaminhar para retenção humana. O objetivo de negócio é reduzir o volume de casos que vão para retenção humana e mensurar essa redução.

Antes deste sistema não havia automação: todo cancelamento ia para retenção humana. O sistema passa a tratar automaticamente os casos de baixo risco (cancela direto) e alto risco (oferta automática), deixando apenas a zona cinzenta para humano.

### Linguagem ubíqua

Leia [`CONTEXT.md`](./CONTEXT.md) antes de começar. Ele define a linguagem do domínio. Os contratos em `packages/contracts/src/types.ts` mapeiam os conceitos do domínio para identificadores em inglês (`Assinante` → `Subscriber`, `Assinatura` → `Subscription`, `Cancelamento` → `Cancellation`). Use os termos em português do `CONTEXT.md` na UI e na documentação; use os identificadores em inglês no código.

## Contratos e endpoints

Você recebe:

- `packages/contracts/src/types.ts` - entidades, enums, interfaces dos agentes, contratos de request/response e as constantes de regra (`LOW_RISK_THRESHOLD`, `HIGH_RISK_THRESHOLD`, `HIGH_VALUE_PERCENTILE`, `SCORING_TIMEOUT_MS`, `HUMAN_RETENTION_COST_CENTS`).
- `packages/contracts/src/scenarios.ts` - 7 cenários com dados de entrada e resultado esperado (risco, faixa, outcome). Use como seed do banco e como base do mock determinístico.
- `packages/contracts/README.md` - tabela dos cenários, determinismo dos ids (UUID v7 estável) e a fórmula fixada da regra de alto valor.

### Endpoints

| Método e rota                     | Request                     | Response                     | Escopo                                                                                 |
| --------------------------------- | --------------------------- | ---------------------------- | -------------------------------------------------------------------------------------- |
| `GET /subscriptions`              | -                           | `SubscriptionListResponse`   | Núcleo. Tela inicial: assinatura + assinante + plano                                   |
| `POST /cancellations`             | `CreateCancellationRequest` | `CreateCancellationResponse` | Núcleo. Cria o cancelamento, orquestra os agentes, aplica as regras, devolve o outcome |
| `GET /cancellations/:id`          | -                           | `CancellationDetailResponse` | Núcleo. Detalhe + outcome (navegação direta para a tela de resultado)                  |
| `POST /cancellations/:id/accept`  | `AcceptOfferRequest`        | `OfferActionResponse`        | Stretch. `Offer.status` → `ACCEPTED`                                                   |
| `POST /cancellations/:id/decline` | `DeclineOfferRequest`       | `OfferActionResponse`        | Stretch. `Offer.status` → `DECLINED`                                                   |
| `GET /metrics`                    | -                           | `MetricsResponse`            | Stretch. Dashboard da PoC                                                              |

**`Cancellation.outcome` é opcional** e o schema tem de refletir isso: enquanto o scoring não terminou, o outcome não existe (não invente um valor default).

**`humanReason`** é string livre curta e descritiva, com semântica consistente. Os cenários trazem exemplos (`grey zone`, `high recurring value at high risk`, `scoring agent timeout`) que servem de referência de estilo. A avaliação olha a semântica, não a igualdade literal da string.

## Regras de decisão

### Faixas de risco

| Faixa         | Risco                 | Ação                                     | `OutcomeType`     |
| ------------- | --------------------- | ---------------------------------------- | ----------------- |
| Baixo risco   | `< 0.30`              | Prossegue com o cancelamento, sem oferta | `CANCELLED`       |
| Zona cinzenta | `>= 0.30` e `<= 0.70` | Encaminha para retenção humana           | `HUMAN_RETENTION` |
| Alto risco    | `> 0.70`              | Oferta de retenção automática            | `AUTOMATIC_OFFER` |

Os limites são exclusivos: risco exatamente `0.30` ou exatamente `0.70` cai na zona cinzenta. Isole essa regra e cubra os limites com testes.

### Regra secundária: alto valor recorrente

Assinaturas cujo `plan.priceCents` está no top 20% dos **valores distintos** de plano têm a oferta automática interceptada: em risco alto, vão para retenção humana (`humanReason` descritivo, ex.: `high recurring value at high risk`). Baixo risco e zona cinzenta seguem as regras normais, independentemente do valor.

Fórmula fixada (a mesma de `packages/contracts/README.md`): ordene em ordem crescente os `priceCents` distintos, `k = ceil(HIGH_VALUE_PERCENTILE * n)` com `n` = quantidade de preços distintos, e considere alto valor os `k` maiores. Com os 3 planos do seed: `k = 1` → apenas Premium (R$ 199).

O corte tem de ser **derivado do banco** (`SELECT DISTINCT price_cents ...`), não hardcoded por nome de plano ou por valor. O avaliador pode alterar preços do seed e revalidar.

### Fallback de timeout

Se o Agente de Scoring não responder dentro de `SCORING_TIMEOUT_MS` (3000 ms), o caminho é conservador: zona cinzenta, `HUMAN_RETENTION`, `humanReason` no estilo `scoring agent timeout`, e `Cancellation.risk` fica indefinido (não invente um risco).

O mock precisa **exercitar o caminho real**: no cenário de timeout, a chamada ao agente passa do prazo e é o serviço que aplica o deadline (ex.: `Promise.race` com timer). Devolver `timedOut: true` sem respeitar o prazo não conta. O teste do cenário de timeout pode ser lento de propósito (é o ponto).

### Comportamento do POST

`POST /cancellations` é **síncrono**: ele aguarda os agentes (200 a 1500 ms de latência simulada, ~3000 ms no cenário de timeout) e devolve o outcome no corpo. Não é necessário fila, job, polling ou webhook.

No frontend, a tela de **Processando** é o estado pendente real da Server Action (ou do fetch) enquanto o POST não responde. É proibido `setTimeout`/sleep artificial na UI para "simular" processamento: a latência vem do backend. A tela de resultado pode ser a própria transição (o `<Suspense>` com fallback de loading) ou uma tela dedicada que lê o outcome.

### Oferta de retenção automática

Quando o outcome é `AUTOMATIC_OFFER`, persista uma `Offer` com `type: DISCOUNT`, `status: PENDING` e `amountCents` calculado (ex.: 20% do valor do plano) e documentado no README. O valor exato não é prescrito; a coerência entre o cálculo e o que está documentado é.

### Métricas (stretch)

Se implementar `GET /metrics`:

- `totalCancellations`: cancelamentos com outcome definido.
- `automaticCancellations`: outcome `CANCELLED` somado aos `AUTOMATIC_OFFER` cuja oferta foi aceita, se você implementar accept/decline. Documente a escolha.
- `humanRetentions`: outcome `HUMAN_RETENTION`.
- `avoidedCostCents`: `(totalCancellations - humanRetentions) * HUMAN_RETENTION_COST_CENTS`.
- `retentionRate`: `automaticCancellations / totalCancellations` (0 quando não houver cancelamentos).
- `riskDistribution`: **contagem** de cancelamentos por `RiskBand` (não fração). O cenário de timeout conta em `GREY`, já que a faixa é definida mesmo sem risco numérico.

## Cenários do seed

| id                         | Assinante       | Plano            | Risco | Faixa | Outcome esperado  | `humanReason`                       |
| -------------------------- | --------------- | ---------------- | ----- | ----- | ----------------- | ----------------------------------- |
| `scenario-low`             | Ana Costa       | Basic (R$ 29)    | 0.15  | LOW   | `CANCELLED`       | -                                   |
| `scenario-grey`            | Bruno Lima      | Standard (R$ 49) | 0.50  | GREY  | `HUMAN_RETENTION` | `grey zone`                         |
| `scenario-high`            | Carla Dias      | Basic (R$ 29)    | 0.85  | HIGH  | `AUTOMATIC_OFFER` | -                                   |
| `scenario-high-value-high` | Diego Reis      | Premium (R$ 199) | 0.80  | HIGH  | `HUMAN_RETENTION` | `high recurring value at high risk` |
| `scenario-timeout`         | Eva Souza       | Standard (R$ 49) | -     | GREY  | `HUMAN_RETENTION` | `scoring agent timeout`             |
| `scenario-high-value-low`  | Felipe Nunes    | Premium (R$ 199) | 0.10  | LOW   | `CANCELLED`       | -                                   |
| `scenario-grey-high-value` | Gabriela Mendes | Premium (R$ 199) | 0.55  | GREY  | `HUMAN_RETENTION` | `grey zone`                         |

O mock do Agente de Scoring é chaveado por `subscriptionId`: devolve `expectedRisk` para os cenários com risco e simula timeout (`simulateTimeout`) no `scenario-timeout`. `ScoringResult.latencyMs` deve reportar a latência simulada, não o tempo real de parede.

## Entrega obrigatória

### Backend (NestJS + PostgreSQL)

1. **Modelagem completa:** migrations para todas as entidades de `packages/contracts/src/types.ts` (`Subscriber`, `Plan`, `Subscription`, `EngagementEvent`, `PaymentEvent`, `Cancellation`, `Offer`). Modele status, relacionamentos, risco, faixa e outcome (opcional).
2. **Seed:** carregue os cenários de `packages/contracts/src/scenarios.ts` no banco de maneira reproduzível.
3. **Endpoints** da tabela de [Contratos e endpoints](#contratos-e-endpoints) (núcleo).
4. **Agente de Scoring:** implemente a interface `ScoringAgent`. Mock determinístico para os cenários, com latência simulada e o timeout de [Regras de decisão](#regras-de-decisão). Não chame LLM real no núcleo.
5. **Regras de decisão** isoladas, testáveis sem HTTP nem banco.
6. **Dependency Injection** de verdade: o `ScoringAgent` é provider injetável e substituível (os testes devem poder trocar por um fake).
7. **Logging estruturado** (pino, winston ou similares).
8. **Validação de input** (class-validator, Zod, etc).
9. **Tratamento de erros global** (exception filter).
10. **Documentação de API** (OpenAPI/Swagger ou similar).
11. **Docker:** `docker compose up` sobe Postgres + API + frontend.
12. **Testes:** ao menos um e2e do fluxo principal (`POST /cancellations` → outcome correto) e unitários das regras cobrindo todos os cenários e os limites (`0.30` e `0.70`).
13. **CI:** workflow mínimo com lint + typecheck + testes.

### Frontend (Next.js + Tailwind)

1. **Telas do fluxo:**
   - **Iniciar:** assinante escolhe a assinatura e vê detalhes (plano, valor, tempo de casa, uso).
   - **Motivo:** texto livre (campo `rawReason`). A classificação em categoria canônica é stretch; o input do assinante é sempre texto livre.
   - **Processando:** loading real da chamada (sem sleep artificial).
   - **Resultado:** risco, motivo (categoria se o stretch estiver feito) e ação tomada (oferta / retenção humana / cancelamento).
2. **Server Components vs Client Components** com critério (exibição versus interação).
3. **Streaming com `<Suspense>`** na transição processando → resultado.
4. **Server Actions ou Route Handlers** para submeter o cancelamento.
5. **Acessibilidade:** navegação por teclado, foco visível, labels, ARIA onde fizer sentido.
6. **Tailwind** para estilização. Layout limpo e funcional, sem exigência de pixel-perfect.

### Dados (PostgreSQL)

1. Schema completo a partir de `packages/contracts/src/types.ts`.
2. **Justifique índices** nas tabelas transacionais (`Cancellation` ao menos): diga quais índices criou, por quê, e inclua `EXPLAIN` como apoio. O seed é pequeno; a avaliação considera o raciocínio.

## Diferenciais (stretch)

Cada um mostra senioridade. Faça o que couber no tempo e diga no README o que ficou de fora e por quê.

- **Agente de Classificação:** implementa `ClassificationAgent`, mock determinístico, em paralelo ao scoring (`Promise.all`). É enriquecimento: se falhar, o outcome não cai (usa o motivo bruto). Exiba a categoria no resultado.
- **Adapter LLM real:** um adapter concreto (ex.: `OpenAIScoringAgent`) com prompt design e function calling ou JSON mode, com schema próprio para `ScoringResult` e fallback. Não precisa rodar sem chave: documente como rodaria.
- **Botões de resultado:** aceitar/recusar a oferta com Server Actions, persistência e invalidação de cache (`POST /cancellations/:id/accept` e `/decline`).
- **Tela de medidas:** dashboard com taxa de retenção, custo evitado e distribuição de risco (`GET /metrics`).
- **Caching avançado:** `revalidateTag`/ISR na tela de medidas e invalidação depois do outcome.
- **Design polido:** design tokens, transições, microinterações, view transitions, estados de erro e vazio.

## Stack

- **Frontend:** Next.js (App Router), TypeScript, Tailwind CSS.
- **Backend:** NestJS, TypeScript.
- **Banco:** PostgreSQL.
- **IA:** adapter mock determinístico (obrigatório); adapter LLM real (stretch, sem execução).
- **Monorepo:** pnpm workspaces + Turborepo (build ordenado, cache local, tarefas por pacote).
- **Infra:** Docker, docker compose, GitHub Actions (CI mínimo).

## Entregáveis

1. **Repositório Git** com histórico incremental e [Conventional Commits](https://www.conventionalcommits.org/pt-br/) (`feat:`, `fix:`, `refactor:`, `test:`, `docs:`, `chore:`). O histórico é avaliado. O baseline do scaffold já é um commit; os seus vêm depois.
2. **README na raiz do seu repositório** com:
   - Como rodar (`docker compose up` e/ou os comandos locais).
   - Decisões e trade-offs (por que este ORM, por que esta modelagem, por que esta oferta).
   - O que é núcleo e o que é stretch, e o que ficou de fora.
   - Justificativa dos índices com o `EXPLAIN`.
   - Como o adapter LLM funcionaria com uma chave real.
   - Como você usou IA (ou que não usou).
3. **`pnpm verify` verde** e **CI verde** no repositório.
4. _(Opcional)_ Vídeo de 3 a 5 minutos de walkthrough, se solicitado.

## Critérios de aceite

Checklist do que o avaliador vai exercitar. Todos os itens de núcleo precisam passar:

- [ ] `pnpm verify` verde e `docker compose up` subindo Postgres + API + UI.
- [ ] `GET /subscriptions` devolve as assinaturas ativas com assinante e plano.
- [ ] Fluxo navegável: escolher assinatura → motivo em texto livre → processando → resultado coerente com a faixa.
- [ ] Os 7 cenários do seed reproduzem o risco, a faixa e o outcome esperados, incluindo os dois de alto valor e o de timeout.
- [ ] Risco exatamente `0.30` e `0.70` cai na zona cinzenta (teste unitário visível).
- [ ] Timeout respeita `SCORING_TIMEOUT_MS` e cai na zona cinzenta.
- [ ] `Cancellation.outcome` é opcional no schema.
- [ ] Nenhum `any` em ponto de decisão; sem `@ts-ignore` para calar o compilador.
- [ ] Índices justificados com `EXPLAIN` no README.
- [ ] Sem `console.log`: logging estruturado.
- [ ] Input validado e erros tratados por exception filter.
- [ ] UI operável por teclado, com labels e foco visível.
- [ ] Histórico de commits incremental em Conventional Commits.

## Perguntas frequentes

**Posso mudar o scaffold (estrutura de pastas, scripts, configs)?**
Pode, desde que `pnpm verify` continue verde e `packages/contracts/` fique intocado. Se mudar algo estrutural, explique no README.

**Posso trocar o ORM ou usar SQL puro?**
Sim. O `pg` está instalado, mas Drizzle, Prisma, TypeORM, Kysely ou SQL puro são escolhas suas. O que se avalia é a modelagem, as migrations e a justificativa.

**Como instalo uma dependência no monorepo?**
Sempre com filtro, da raiz: `pnpm --filter @repo/backend add drizzle-orm`, `pnpm --filter @repo/frontend add zod`. Para uma ferramenta de repositório, `pnpm add -D -w <pacote>`. Não use `npm install` nem `yarn`: o workspace é pnpm e outro lockfile quebra a resolução.

**Preciso mexer no `turbo.json`?**
Provavelmente não. Se criar uma tarefa nova (ex.: `db:migrate`), registre no `turbo.json` e chame com `pnpm --filter @repo/backend`. Se a tarefa gerar arquivos, declare `outputs` para o cache funcionar.

**Preciso de autenticação, multi-tenant ou i18n?**
Não.

**A latência simulada vai deixar meus testes lentos?**
O e2e do scaffold mostra o padrão: substitua o provider (`overrideProvider`) ou injete um agente fake. O único teste que pode ser lento de propósito é o do cenário de timeout.

**Posso desligar o React Compiler ou as rotas tipadas do Next?**
Pode, se atrapalhar. Explique no README.

**Posso mexer no `docker-compose.yml`?**
Sim, e deve: hoje ele só tem o Postgres. No fim, `docker compose up` precisa subir o fluxo completo.

**Preciso implementar o Agente de Classificação ou o adapter LLM?**
Não. São stretch e contam no eixo de diferenciais.

**E se eu achar um erro na especificação?**
Escreva no README ou abra uma issue no repositório. Explique o problema; editar `packages/contracts/` em silêncio conta contra.

**Dúvidas durante o teste?**
Abra uma issue no repositório ou mande mensagem para quem te enviou o teste. Resposta em até 1 dia útil; não fique travado esperando.
