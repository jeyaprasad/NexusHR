# ─────────────────────────────────────────────────────────────────────────────
# Single Stage Build — TanStack Start (SSR) with Bun
# We use a single stage so that Bun's internal symlinks (node_modules -> global cache)
# do not break during stage-copying.
# ─────────────────────────────────────────────────────────────────────────────
FROM oven/bun:1-alpine
WORKDIR /app

# Copy lock files first for better layer caching
COPY bun.lock package.json ./
RUN bun install

# Copy source code and build
COPY . .
RUN bun run build

EXPOSE 3000
ENV PORT=3000
ENV HOST=0.0.0.0

# Run the custom server to serve both static assets and SSR
CMD ["bun", "run", "server.ts"]
