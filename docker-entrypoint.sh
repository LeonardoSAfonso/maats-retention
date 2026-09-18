#!/bin/sh
set -e

echo "==> Executando migrations do banco de dados..."
pnpm --filter @repo/backend db:migrate

echo "==> Executando seed de dados..."
pnpm --filter @repo/backend db:seed

echo "==> Iniciando aplicação..."
exec "$@"
