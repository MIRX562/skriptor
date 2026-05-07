# Use the official Bun image
FROM oven/bun:latest AS base
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
ENV BETTER_AUTH_SECRET=dummy_secret
RUN bun run build

# Step 3: Production runner
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Create a non-root user for security
RUN groupadd -g 1001 nodejs
RUN useradd -u 1001 -g nodejs nextjs

# Copy standalone build and static assets
# Standalone includes minimal node_modules
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Start the application
CMD ["bun", "server.js"]
