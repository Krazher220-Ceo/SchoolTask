#!/bin/bash
set -e

echo "Generating Prisma Client..."
npx prisma generate

echo "Applying migrations..."
if npx prisma migrate deploy; then
  echo "Migrations applied successfully"
else
  MIGRATION_ERROR=$?
  if echo "$MIGRATION_ERROR" | grep -q "P3019"; then
    echo "Detected provider mismatch. Marking baseline migration as applied..."
    npx prisma migrate resolve --applied 20251209055319_init
    echo "Retrying migrations..."
    npx prisma migrate deploy
  else
    echo "Migration failed with error: $MIGRATION_ERROR"
    exit 1
  fi
fi

