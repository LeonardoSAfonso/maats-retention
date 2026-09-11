# @repo/backend

API da PoC **Cancelamento com Retenção Inteligente** (teste técnico Dev Sr Fullstack).

NestJS 12 + TypeScript estrito + PostgreSQL, dentro de um monorepo pnpm + Turborepo.

## Rodar

A partir da raiz do repositório:

```bash
pnpm install
cp ../.env.example ../.env      # se ainda não existir (credenciais do Postgres)
pnpm db:up                      # docker compose up -d db
pnpm dev:backend                # http://localhost:3000
```

Só a API: `pnpm --filter @repo/backend dev`. Variáveis de ambiente em `.env` nesta pasta (copie de
`.env.example`); sem o arquivo, os defaults batem com o compose. A API sobe mesmo com o banco
parado: `GET /health` responde `{"status":"ok","db":"down"}` nesse caso.

Dependências do workspace (`@repo/contracts`) são compiladas automaticamente antes, porque o turbo
resolve `dependsOn: ["^build"]`.

## Scripts

| Script       | O que faz                                         |
| ------------ | ------------------------------------------------- |
| `dev`        | watch mode (`nest start --watch`)                 |
| `build`      | `nest build` + reescrita dos aliases para `dist/` |
| `start:prod` | roda o build (`node dist/main.js`)                |
| `lint`       | ESLint (preset `@repo/lint/eslint/nest`)          |
| `typecheck`  | `tsc -p tsconfig.json`                            |
| `test`       | testes unitários (vitest)                         |
| `test:e2e`   | testes e2e (vitest + supertest)                   |
| `format`     | Prettier                                          |

## O que já existe

- Bootstrap do Nest (`src/main.ts`) com `dotenv`, shutdown hooks e porta em `PORT` (default 3000).
- `DbModule` (`src/db/db.module.ts`): um `Pool` de `pg` injetável pelo token `DB_POOL`, lendo
  `DATABASE_URL`. Nenhuma conexão é aberta antes da primeira query.
- `GET /health` (`src/app.controller.ts` + `src/app.service.ts`) com ping do banco.
- Middleware de log de requisições (`src/common/middlewares/app-logger.middleware.ts`).
- Testes de exemplo verdes: `src/app.service.spec.ts` (unit, pool mockado) e `test/app.e2e-spec.ts`
  (e2e de `/health` com `overrideProvider(DB_POOL)`).

## O que **não** existe (é o teste)

- Modelagem de dados, migrations e seed (`plans`, `subscribers`, `subscriptions`, eventos,
  cancelamentos, ofertas).
- Módulos `Subscriptions` e `Cancellations` (controllers, services, DTOs), regras de decisão e os
  agentes (`ScoringAgent`, `ClassificationAgent`).
- Escolha de ORM/query builder: **livre**. O driver `pg` está disponível; Drizzle, Prisma, TypeORM
  ou SQL puro são decisões suas, justifique no README.
- Logging estruturado (pino/winston), validação de input, exception filter global e documentação
  OpenAPI: itens do teste.
- Serviço no `docker-compose.yml`: o compose da raiz traz só o Postgres hoje.

Escopo, regras de decisão e critérios de avaliação: `TESTE.md` e `RUBRICA.md` na raiz.

## Contratos

`@repo/contracts` é a especificação (entidades, constantes, cenários). Importe pelo nome do pacote:

```ts
import { scenarios, SCORING_TIMEOUT_MS, type ScoringAgent } from "@repo/contracts";
```

Não edite `packages/contracts/`.

## Convenções que o repo já aplica

- TypeScript estrito, com `noUncheckedIndexedAccess` e `exactOptionalPropertyTypes` (config em
  `@repo/tsconfig/nest.json`).
- ESM (`"type": "module"`). Imports internos usam o alias `@/*` → `src/*`; o `tsc-alias` reescreve
  para `./arquivo.js` no build, então `start:prod` funciona como está. `outDir` e `paths` ficam no
  tsconfig deste app, não no compartilhado.
- Aliases também resolvidos nos testes (`resolve.tsconfigPaths` nos `vitest.config*.ts`).
- Pre-commit: `pnpm exec lefthook install` uma vez no clone (a config está na raiz).
