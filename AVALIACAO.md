# Ficha de avaliação

Uma ficha por candidato. Copie este arquivo, preencha e anexe ao feedback.

|                                   |     |
| --------------------------------- | --- |
| **Candidato**                     |     |
| **Avaliador**                     |     |
| **Data**                          |     |
| **Repositório / commit avaliado** |     |
| **Tempo declarado de trabalho**   |     |

## 1. Sanity checks (rodar antes de ler código)

| #   | Verificação                  | Comando / como fazer                                                                             | Resultado              |
| --- | ---------------------------- | ------------------------------------------------------------------------------------------------ | ---------------------- |
| 1   | Baseline verde               | `pnpm verify` na raiz                                                                            | passou / falhou        |
| 2   | Spec intocada                | `git diff packages/contracts` e o teste do próprio pacote                                        | passou / divergiu      |
| 3   | Soberania do fluxo no Docker | `docker compose up` sobe Postgres + API + UI                                                     | passou / falhou        |
| 4   | Sem gambiarra de tipagem     | rodar `rg "@ts-ignore" apps` e `rg ": any" apps`                                                 | achados:               |
| 5   | Sem log solto                | rodar `rg "console.log" apps`                                                                    | achados:               |
| 6   | Limites de faixa             | procurar teste unitário para `0.30` e `0.70`                                                     | existe / não existe    |
| 7   | Timeout real                 | ler o caminho do timeout: usa `SCORING_TIMEOUT_MS` e deadline real?                              | sim / parcial / não    |
| 8   | Regra de alto valor derivada | o corte vem de consulta aos preços distintos, ou está hardcoded?                                 | derivado / hardcoded   |
| 9   | Generalização do alto valor  | alterar um `priceCents` do seed e revalidar (ex.: subir um segundo plano ao topo)                | passou / quebrou       |
| 10  | `outcome` opcional           | inspecionar o schema da tabela `Cancellation`                                                    | opcional / obrigatório |
| 11  | Custo evitado                | conferir contra a fórmula fixada em `TESTE.md`, seção Regras de decisão                          | correto / divergente   |
| 12  | Histórico                    | `git log --oneline` incremental e em Conventional Commits                                        | passou / falhou        |
| 13  | CI                           | workflow com lint + typecheck + testes, verde                                                    | passou / falhou        |
| 14  | Pipeline do monorepo         | `pnpm build` respeita a ordem (`@repo/contracts` antes dos apps) e `pnpm verify` aproveita cache | passou / falhou        |
| 15  | Descrição de IA              | README diz como usou IA (ou que não usou)                                                        | presente / ausente     |

## 2. Notas por eixo

Escala por item: **0** ausente, **1** parcial, **2** atende o esperado, **3** acima do esperado.

### Eixo 1 - Arquitetura fullstack (peso 30%)

| Item                                                          | Nota | Evidência (arquivo / trecho) |
| ------------------------------------------------------------- | ---- | ---------------------------- |
| Camadas separadas, frontend sem acesso direto ao banco        |      |                              |
| `ScoringAgent` isolado e injetável via DI                     |      |                              |
| Server vs Client Components com critério                      |      |                              |
| Erros tratados nas bordas (timeout → zona cinzenta)           |      |                              |
| Bounded contexts visíveis na estrutura de módulos             |      |                              |
| Contratos de `types.ts` usados consistentemente nos endpoints |      |                              |
| **Subtotal do eixo**                                          | /18  |                              |

### Eixo 2 - Qualidade de código (peso 25%)

| Item                                                                                  | Nota | Evidência |
| ------------------------------------------------------------------------------------- | ---- | --------- |
| TypeScript estrito, sem `any` em ponto de decisão                                     |      |           |
| Validação de input (class-validator ou Zod)                                           |      |           |
| Logging estruturado (pino/winston)                                                    |      |           |
| Migrations com rollback + seed reproduzível                                           |      |           |
| Conventional Commits incremental                                                      |      |           |
| Testes do caminho crítico e dos limites de faixa                                      |      |           |
| CI verde                                                                              |      |           |
| Domínio mapeado para identificadores consistentes (inglês no código, português na UI) |      |           |
| **Subtotal do eixo**                                                                  | /24  |           |

### Eixo 3 - Domínio e decisão (peso 25%)

| Item                                                                   | Nota | Evidência |
| ---------------------------------------------------------------------- | ---- | --------- |
| Faixas corretas, com limites inclusivos na zona cinzenta               |      |           |
| Regra de alto valor interceptando só a oferta automática em alto risco |      |           |
| Corte de alto valor derivado dos dados                                 |      |           |
| Fallback de timeout usando `SCORING_TIMEOUT_MS`                        |      |           |
| Modelo coerente com a linguagem ubíqua; `outcome` opcional             |      |           |
| `humanReason` descritivo e coerente com cada caminho                   |      |           |
| Oferta automática com `amountCents` calculado e documentado            |      |           |
| `EventoPagamento` e `EventoEngajamento` integrados ao scoring          |      |           |
| **Subtotal do eixo**                                                   | /24  |           |

### Eixo 4 - Diferenciais (peso 20%)

| Item                                                              | Nota | Evidência |
| ----------------------------------------------------------------- | ---- | --------- |
| Mock determinístico cobrindo todos os cenários do seed            |      |           |
| `<Suspense>` funcionando na transição processando → resultado     |      |           |
| `GET /subscriptions` com dados completos                          |      |           |
| Agente de Classificação (mock em paralelo)                        |      |           |
| Adapter LLM com function calling / JSON mode e prompt justificado |      |           |
| Docker compose completo e documentado                             |      |           |
| Tela de medidas com caching/invalidação                           |      |           |
| Botões de aceitar/recusar oferta com Server Actions               |      |           |
| Índices justificados com `EXPLAIN`                                |      |           |
| **Subtotal do eixo**                                              | /27  |           |

## 3. Desclassificação automática (qualquer item marcado aqui derruba o candidato)

- [ ] Sem testes no caminho crítico
- [ ] Tipagem fraca ou `any` em ponto de decisão
- [ ] Índices não justificados nas tabelas transacionais
- [ ] Commit único ou histórico sem Conventional Commits
- [ ] `Cancellation.outcome` obrigatório no schema

## 4. Red flags (baixam a nota, não desclassificam)

- [ ] SQL direto em componente de frontend
- [ ] `console.log` como log
- [ ] Timeout sem fallback ou hardcoded fora de `SCORING_TIMEOUT_MS`
- [ ] UI não navegável por teclado / sem labels
- [ ] Server e Client Components misturados sem critério
- [ ] Migration sem rollback ou seed não reproduzível
- [ ] README sem justificativa de decisões
- [ ] Compose que não sobe com `docker compose up`
- [ ] Sem `GET /subscriptions`

## 5. Sinais de senioridade forte

- [ ] Justifica trade-offs no README (por que X e não Y)
- [ ] Regras de domínio em módulo próprio, testável isoladamente
- [ ] UX madura com latência simulada (loading, erro, retry)
- [ ] Adapter LLM com schema de function calling bem desenhado
- [ ] Estende o modelo de dados sem quebrar o fluxo existente
- [ ] Comunica dúvidas e decisões via commits/README
- [ ] Aponta problema na especificação com argumento
- [ ] Uso de IA declarado e defensável (não é penalizado por si só)

## 6. Resultado

| Eixo                  | Peso | Nota normalizada (0 a 1) | Pontos |
| --------------------- | ---- | ------------------------ | ------ |
| Arquitetura fullstack | 30%  |                          |        |
| Qualidade de código   | 25%  |                          |        |
| Domínio e decisão     | 25%  |                          |        |
| Diferenciais          | 20%  |                          |        |
| **Total**             | 100% |                          |        |

**Barra de aprovação (sugestão):** zero itens de desclassificação, nenhum item de núcleo ausente, `Domínio e decisão` em 60% ou mais e total em 60% ou mais. Os eixos de arquitetura e domínio pesam mais na decisão do que o total isolado; `feel` técnico do avaliador senior continua contando.

**Recomendação:** avançar / avançar para outra vaga / banco de talentos / não avançar

**Feedback para o candidato (2 a 4 pontos concretos):**

1.
2.
3.
