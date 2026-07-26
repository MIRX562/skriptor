# Build stage uses Bun for lockfile-compatible installs
FROM docker.io/oven/bun:1.3.14 AS base
WORKDIR /app

# Step 1: Install dependencies
FROM base AS deps
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

# Step 2: Build the application
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production
ENV RESEND_API_KEY=re_123456789
ENV REDIS_URL=redis://localhost:6379
ENV DATABASE_URL=postgresql://postgres:postgres@localhost:5432/skriptor
ENV BETTER_AUTH_SECRET=dummy_secret_dummy_secret_dummy_
ENV BETTER_AUTH_URL=http://localhost:3000
ENV GOOGLE_CLIENT_ID=dummy-google-client-id
ENV GOOGLE_CLIENT_SECRET=dummy-google-client-secret
RUN bun run build \
    && rm -rf .next/standalone/node_modules/sharp .next/standalone/node_modules/@img

# Step 3: Minimal production runner
FROM gcr.io/distroless/nodejs22-debian12:nonroot AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# Copy standalone build and static assets
COPY --from=builder --chown=65532:65532 /app/public ./public
COPY --from=builder --chown=65532:65532 /app/.next/standalone ./
COPY --from=builder --chown=65532:65532 /app/.next/static ./.next/static

EXPOSE 3000

# Distroless node image entrypoint is `node`
CMD ["server.js"]
