#!/bin/sh
# Backend Container Entrypoint Script with Graceful Dependency Waiting
set -e

echo "=================================================="
echo " [ICS-SHIELD BACKEND] Initializing Container..."
echo "=================================================="

# Wait for MySQL connection if configured
if [ -n "$DATABASE_HOST" ]; then
  echo "[1/2] Waiting for database at $DATABASE_HOST:$DATABASE_PORT..."
  max_retries=30
  count=0
  until nc -z -v -w5 "$DATABASE_HOST" "$DATABASE_PORT" 2>/dev/null || [ $count -gt $max_retries ]; do
    echo "  └─ Database not ready yet ($count/$max_retries)... waiting 2s."
    sleep 2
    count=$((count + 1))
  done
fi

echo "[2/2] Starting Node.js Backend Application..."
exec "$@"
