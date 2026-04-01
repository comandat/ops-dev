#!/bin/sh
set -e

echo "[OpenSales] Pushing Prisma schema to database..."
npx prisma db push --accept-data-loss

echo "[OpenSales] Starting backend..."
exec node dist/main.js
