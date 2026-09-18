# syntax=docker/dockerfile:1

ARG NODE_VERSION=22

# ==========================================
# 1. Base image with Node 22, pnpm, and turbo
# ==========================================
FROM node:${NODE_VERSION}-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PNPM_HOME/bin:$PATH"
RUN apk add --no-cache libc6-compat openssl
RUN corepack enable && corepack prepare pnpm@11.10.0 --activate
RUN npm install -g turbo@^2.10.12

# ==========================================
# 2. Pruner stage - Backend
# ==========================================
FROM base AS pruner
WORKDIR /app
COPY . .
RUN turbo prune @repo/backend --docker

# ==========================================
# 3. Builder stage - Backend
# ==========================================
FROM base AS builder
WORKDIR /app

# First install dependencies with lockfile caching
COPY --from=pruner /app/out/json/ .
COPY --from=pruner /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --from=pruner /app/out/pnpm-workspace.yaml ./pnpm-workspace.yaml
RUN pnpm install --frozen-lockfile

# Copy full sources
COPY --from=pruner /app/out/full/ .
COPY turbo.json ./turbo.json

RUN pnpm --filter @repo/contracts build
RUN pnpm --filter @repo/backend db:generate
RUN pnpm --filter @repo/backend build

# ==========================================
# 4. Production Runner - Backend (NestJS API)
# ==========================================
FROM node:${NODE_VERSION}-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
ENV HOME="/home/nestjs"
ENV PNPM_HOME="/home/nestjs/.pnpm"
ENV PATH="$PNPM_HOME:$PNPM_HOME/bin:$PATH"

RUN apk add --no-cache libc6-compat openssl wget
RUN corepack enable && corepack prepare pnpm@11.10.0 --activate

RUN addgroup --system --gid 1001 nodejs && \
    adduser -S -u 1001 -G nodejs -h /home/nestjs nestjs && \
    mkdir -p /home/nestjs/.pnpm && \
    chown -R nestjs:nodejs /home/nestjs

# Copy pruned workspace structure with installed packages & builds
COPY --from=builder --chown=nestjs:nodejs /app /app
COPY --chown=nestjs:nodejs docker-entrypoint.sh ./docker-entrypoint.sh
RUN chmod +x ./docker-entrypoint.sh

USER nestjs
EXPOSE 3000

ENTRYPOINT ["./docker-entrypoint.sh"]
CMD ["node", "apps/backend/dist/main.js"]
