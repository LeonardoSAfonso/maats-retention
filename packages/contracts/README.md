# `@repo/contracts` - especificação congelada do teste

Pacote do workspace com a especificação: entidades, constantes de regra, contratos de
request/response e os cenários do seed. Nada aqui é código do candidato.

| Arquivo                  | O que é                                                                                                                                                                                                                                                                            |
| ------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/types.ts`           | Entidades de domínio, enums dos agentes de IA, contratos de request/response dos endpoints e as constantes de regra (`LOW_RISK_THRESHOLD`, `HIGH_RISK_THRESHOLD`, `HIGH_VALUE_PERCENTILE`, `SCORING_TIMEOUT_MS`, `HUMAN_RETENTION_COST_CENTS`).                                    |
| `src/scenarios.ts`       | 7 cenários com assinante, plano, assinatura, eventos de engajamento, eventos de pagamento, motivo bruto e resultado esperado. Também exporta as listas prontas para seed (`plans`, `subscribers`, `subscriptions`, `engagementEvents`, `paymentEvents`) e as constantes de oferta. |
| `test/contracts.spec.ts` | Trava as regras acima: se alguém editar um limiar ou um cenário esperado, o `pnpm verify` acusa.                                                                                                                                                                                   |

## Como consumir

Os dois apps declaram a dependência (`"@repo/contracts": "workspace:*"`) e importam pelo nome do
pacote:

```ts
// backend: seed, regras de decisão, mock do agente
import { scenarios, SCORING_TIMEOUT_MS, type ScoringAgent, type Plan } from "@repo/contracts";

// frontend: tipos das respostas da API
import type { SubscriptionListResponse, CancellationDetailResponse } from "@repo/contracts";
```

O pacote é compilado (`tsc` -> `dist`), então o build dele roda antes do build dos apps: o turbo
cuida disso com `dependsOn: ["^build"]`, e `pnpm verify` / `pnpm build` já fazem a ordem certa.

**Não edite este pacote.** Ele é a especificação, e a rubrica trata alterá-la como desclassificação.
Se encontrar um erro ou ambiguidade, escreva no README do seu repositório e explique o problema.

## Cenários (seed e mock determinístico)

| id                         | Assinante       | Plano            | Risco | Faixa | Outcome esperado  | `humanReason`                       |
| -------------------------- | --------------- | ---------------- | ----- | ----- | ----------------- | ----------------------------------- |
| `scenario-low`             | Ana Costa       | Basic (R$ 29)    | 0.15  | LOW   | `CANCELLED`       | -                                   |
| `scenario-grey`            | Bruno Lima      | Standard (R$ 49) | 0.50  | GREY  | `HUMAN_RETENTION` | `grey zone`                         |
| `scenario-high`            | Carla Dias      | Basic (R$ 29)    | 0.85  | HIGH  | `AUTOMATIC_OFFER` | -                                   |
| `scenario-high-value-high` | Diego Reis      | Premium (R$ 199) | 0.80  | HIGH  | `HUMAN_RETENTION` | `high recurring value at high risk` |
| `scenario-timeout`         | Eva Souza       | Standard (R$ 49) | -     | GREY  | `HUMAN_RETENTION` | `scoring agent timeout`             |
| `scenario-high-value-low`  | Felipe Nunes    | Premium (R$ 199) | 0.10  | LOW   | `CANCELLED`       | -                                   |
| `scenario-grey-high-value` | Gabriela Mendes | Premium (R$ 199) | 0.55  | GREY  | `HUMAN_RETENTION` | `grey zone`                         |

### Determinismo

Todos os ids (planos, assinantes, assinaturas, eventos) são UUID v7 derivados de um seed estável do
`id` do cenário (`fnv1a` + `uuidv7`), então saem iguais a cada execução. O mock do Agente de Scoring
usa `subscriptionId` como chave: `scenario-*` → `expectedRisk`; `scenario-timeout` →
`simulateTimeout: true`.

### Regra de alto valor (fórmula fixada)

Ordene em ordem crescente os `priceCents` **distintos** cadastrados no banco;
`k = ceil(HIGH_VALUE_PERCENTILE * n)`, com `n` = quantidade de preços distintos; os `k` maiores
preços são "alto valor". Com os 3 planos do seed: `k = ceil(0.6) = 1` → apenas Premium (R$ 199).

O corte tem de ser **derivado dos dados** (`SELECT DISTINCT price_cents ...`), não hardcoded. O
avaliador pode alterar preços do seed e revalidar.

## Scripts

| Script           | O que faz                              |
| ---------------- | -------------------------------------- |
| `pnpm build`     | compila para `dist/` (`.js` + `.d.ts`) |
| `pnpm typecheck` | `tsc -p tsconfig.json`                 |
| `pnpm test`      | roda `test/contracts.spec.ts`          |
| `pnpm lint`      | ESLint                                 |

A partir da raiz: `pnpm --filter @repo/contracts <script>`.
