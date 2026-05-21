# syntax=docker/dockerfile:1

# Builds a self-contained Next.js standalone server with the content already
# seeded into SQLite. Designed to be built natively on the Raspberry Pi (arm64).
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

# --- builder: compile the app and bake content into data/blog.db ---
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm build && pnpm db:seed

# --- runner: minimal runtime image ---
FROM base AS runner
ENV NODE_ENV=production \
    PORT=3000 \
    HOSTNAME=0.0.0.0
WORKDIR /app
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/data ./data
EXPOSE 3000
CMD ["node", "server.js"]
