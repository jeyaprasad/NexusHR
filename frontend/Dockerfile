# ─────────────────────────────────────────────────────────────────────────────
# Stage 1: Build — TanStack Start (SSR) with Bun
# Output lives in /app/dist (TanStack default), NOT /app/.output
# ─────────────────────────────────────────────────────────────────────────────
FROM oven/bun:1-alpine AS builder
WORKDIR /app

# Copy lock files first for better layer caching
COPY bun.lock package.json ./
RUN bun install

COPY . .
RUN bun run build

# ─────────────────────────────────────────────────────────────────────────────
# Stage 2: Runtime — serve the SSR app with Bun
# ─────────────────────────────────────────────────────────────────────────────
FROM oven/bun:1-alpine AS runtime
WORKDIR /app

# Copy package files and install production dependencies directly
# This prevents broken symlink issues from Bun's global cache
COPY package.json bun.lock ./
RUN bun install --production

# Only copy the built assets
COPY --from=builder /app/dist ./dist

EXPOSE 3000
ENV PORT=3000
ENV HOST=0.0.0.0

# Bun automatically runs files exporting `fetch` as an HTTP server
CMD ["bun", "run", "dist/server/server.js"]
