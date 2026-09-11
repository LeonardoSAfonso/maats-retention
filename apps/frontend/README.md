# @repo/frontend

Frontend da PoC **Cancelamento com Retenção Inteligente** (teste técnico Dev Sr Fullstack).

Next.js 16 (App Router) + React 19 + TypeScript estrito + Tailwind CSS 4 + shadcn/ui, dentro de um
monorepo pnpm + Turborepo.

## Rodar

A partir da raiz do repositório:

```bash
pnpm install
pnpm dev:frontend   # http://localhost:3001
```

Só o frontend: `pnpm --filter @repo/frontend dev`. A porta 3001 é do frontend; a 3000 fica para a
API.

Variáveis de ambiente em `.env` nesta pasta (copie de `.env.example`). `NEXT_PUBLIC_API_URL` aponta
para a API (default `http://localhost:3000`).

## Scripts

| Script      | O que faz                                 |
| ----------- | ----------------------------------------- |
| `dev`       | servidor de desenvolvimento na porta 3001 |
| `build`     | build de produção (inclui typecheck)      |
| `start`     | serve o build                             |
| `lint`      | ESLint (preset `@repo/lint/eslint/next`)  |
| `typecheck` | `next typegen && tsc --noEmit`            |
| `format`    | Prettier                                  |

`next typegen` roda antes do `tsc` porque os tipos de rota (`LayoutProps`, `PageProps`) são gerados
pelo Next e não existem em um clone limpo.

## O que já existe

- Layout base com os design tokens do shadcn (`src/app/globals.css`), fontes configuradas e
  `lang="pt-BR"`.
- `src/components/ui/button.tsx` como exemplo de componente no padrão shadcn/base-ui (adicione
  outros com `pnpm dlx shadcn@latest add ...`).
- Uma home neutra (`src/app/page.tsx`) só para provar que o app sobe. Substitua pelo fluxo.

## O que **não** existe (é o teste)

- Telas de início, motivo, processamento e resultado.
- Server Actions / Route Handlers para submeter o cancelamento.
- Consumo de `GET /subscriptions`, `GET /cancellations/:id` e `GET /metrics`.

Escopo, regras de decisão e critérios de avaliação: `TESTE.md` e `RUBRICA.md` na raiz.

## Contratos

`@repo/contracts` é a especificação. O frontend usa os tipos das respostas da API:

```ts
import type { SubscriptionListResponse, CancellationDetailResponse } from "@repo/contracts";
```

É um pacote compilado (não precisa de `transpilePackages`). Não edite `packages/contracts/`.

## Convenções que o repo já aplica

- TypeScript estrito, com `noUncheckedIndexedAccess` e `exactOptionalPropertyTypes` (config em
  `@repo/tsconfig/nextjs.json`).
- React Compiler habilitado (`next.config.ts`), rotas tipadas (`typedRoutes`) e remoção de props de
  dev no build.
- Aliases: `@/*` → `src/*` (declarados no tsconfig deste app, não no compartilhado).
- Pre-commit: `pnpm exec lefthook install` uma vez no clone (a config está na raiz).
