# syntax=docker/dockerfile:1

# Builds a self-contained Next.js standalone server. The DB is NOT baked in —
# at runtime the app opens DATABASE_URL (a PVC-mounted file in production) and
# applies migrations on first connection. Built natively on the Pi (arm64).
FROM node:22-slim AS base
RUN corepack enable
WORKDIR /app

# --- deps: install with build tools for the better-sqlite3 native module ---
FROM base AS deps
RUN apt-get update \
  && apt-get install -y --no-install-recommends python3 make g++ \
  && rm -rf /var/lib/apt/lists/*
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# --- builder: compile the app ---
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Cache mount for Next's build cache so incremental rebuilds across CI runs are
# fast (the COPY above always busts the layer cache, but .next/cache persists).
RUN --mount=type=cache,target=/app/.next/cache pnpm build

# --- runner: minimal runtime image ---
FROM base AS runner
ENV NODE_ENV=production \
    PORT=3000 \
    HOSTNAME=0.0.0.0
WORKDIR /app
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
# Migration SQL must be present at runtime — auto-migrate reads ./db/migrations.
COPY --from=builder /app/db/migrations ./db/migrations
EXPOSE 3000
# DATABASE_URL should point at a persistent volume in production (see gitops).
ENV DATABASE_URL=/data/blog.db
CMD ["node", "server.js"]
