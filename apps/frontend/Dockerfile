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
# 2. Pruner stage - Frontend
# ==========================================
FROM base AS pruner
WORKDIR /app
COPY . .
RUN turbo prune @repo/frontend --docker

# ==========================================
# 3. Builder stage - Frontend
# ==========================================
FROM base AS builder
WORKDIR /app

ARG NEXT_PUBLIC_API_URL=http://localhost:3000
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}

# First install dependencies with lockfile caching
COPY --from=pruner /app/out/json/ .
COPY --from=pruner /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --from=pruner /app/out/pnpm-workspace.yaml ./pnpm-workspace.yaml
RUN pnpm install --frozen-lockfile

# Copy full sources
COPY --from=pruner /app/out/full/ .
COPY turbo.json ./turbo.json

RUN pnpm --filter @repo/contracts build
RUN pnpm --filter @repo/frontend build

# ==========================================
# 4. Production Runner - Frontend (Next.js)
# ==========================================
FROM node:${NODE_VERSION}-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3001
ENV HOSTNAME="0.0.0.0"

RUN apk add --no-cache wget
RUN addgroup --system --gid 1001 nodejs && \
    adduser -S -u 1001 -G nodejs -h /home/nextjs nextjs

# Copy standalone output and static assets
COPY --from=builder --chown=nextjs:nodejs /app/apps/frontend/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/frontend/.next/static ./apps/frontend/.next/static
COPY --from=builder --chown=nextjs:nodejs /app/apps/frontend/public ./apps/frontend/public

USER nextjs
EXPOSE 3001

CMD ["node", "apps/frontend/server.js"]
