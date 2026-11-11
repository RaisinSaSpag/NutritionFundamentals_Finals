# ========================================================
# Stage 1: Build & Compile TypeScript
# ========================================================
FROM node:20-alpine AS builder
WORKDIR /app

# Install dependencies (including devDependencies required for tsc)
COPY package*.json ./
RUN npm ci

# Copy source code and Prisma schema
COPY tsconfig.json ./
COPY prisma ./prisma
COPY src ./src

# Generate Prisma Client and build TypeScript bundle
RUN npx prisma generate --schema=./prisma/schema.prisma
RUN npm run build

# Prune devDependencies to keep production layer lean
RUN npm prune --production

# ========================================================
# Stage 2: Production Minimal Runner (Non-Root)
# ========================================================
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=5000

# Install curl for container health check
RUN apk add --no-cache curl openssl

# Copy only production dependencies and compiled artifacts
COPY package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma

# Security hardening: ensure file ownership and drop root privileges
RUN chown -R node:node /app
USER node

EXPOSE 5000

# Container healthcheck
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:5000/api/health || exit 1

CMD ["node", "dist/index.js"]
