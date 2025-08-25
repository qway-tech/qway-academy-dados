#!/bin/sh
set -e

echo "Aguardando Postgres em $DATABASE_URL"
# Tenta conectar até responder
until psql "$DATABASE_URL" -c 'select 1' >/dev/null 2>&1; do
  sleep 1
done

# Aplica migrações se existirem, senão empurra o schema (dev)
if [ -d prisma/migrations ] && [ "$(ls -A prisma/migrations 2>/dev/null)" ]; then
  echo "Aplicando migrations: prisma migrate deploy"
  npx prisma migrate deploy
else
  echo "Sem migrations, aplicando schema: prisma db push (apenas desenvolvimento)"
  npx prisma db push
fi

# Seed opcional
if [ -f prisma/seed.cjs ]; then
  echo "Executando seed"
  npx prisma db seed || true
fi

echo "Iniciando API"
exec node dist/main.js
