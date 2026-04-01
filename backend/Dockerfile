# ---- Build Stage ----
FROM node:20-alpine AS builder
WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma/

RUN npm ci

COPY . .
RUN npx prisma generate
RUN npm run build

# ---- Production Dependencies Stage ----
FROM node:20-alpine AS prod-deps
WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

# ---- Production Stage ----
FROM node:20-alpine AS runner
WORKDIR /app

COPY --from=builder /app/dist ./dist
# Copy production-only node_modules
COPY --from=prod-deps /app/node_modules ./node_modules
# Copy generated Prisma files safely from builder
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma/client ./node_modules/@prisma/client

COPY --from=builder /app/package.json ./
COPY --from=builder /app/prisma ./prisma

COPY --from=builder /app/plugins ./plugins
COPY entrypoint.sh ./entrypoint.sh

RUN chmod +x entrypoint.sh

EXPOSE 3001
ENV NODE_ENV=production
ENV PORT=3001

ENTRYPOINT ["./entrypoint.sh"]
