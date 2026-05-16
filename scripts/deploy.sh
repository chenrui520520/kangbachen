#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

if [[ ! -f .env ]]; then
  echo "Missing .env — copy .env.example and configure production values."
  exit 1
fi

echo "==> Validating required env"
required=(DATABASE_URL REDIS_URL JWT_SECRET)
for key in "${required[@]}"; do
  if ! grep -q "^${key}=" .env; then
    echo "Missing ${key} in .env"
    exit 1
  fi
done

chmod +x docker/nginx-entrypoint.sh 2>/dev/null || true

if [[ -f certs/fullchain.pem ]] && [[ -f certs/privkey.pem ]]; then
  echo "==> TLS certs found in ./certs/"
  if ! grep -q "^SSL_REDIRECT=" .env 2>/dev/null; then
    echo "Tip: set SSL_REDIRECT=1 in .env to force HTTP→HTTPS"
  fi
else
  echo "==> No TLS certs in ./certs/ — nginx will serve HTTP only on port 80"
  echo "    Place fullchain.pem and privkey.pem in ./certs/ for HTTPS on 443"
fi

echo "==> Building images"
docker compose -f docker-compose.prod.yml build

echo "==> Running migrations"
docker compose -f docker-compose.prod.yml run --rm api pnpm prisma:migrate

echo "==> Seeding (idempotent)"
docker compose -f docker-compose.prod.yml run --rm api pnpm db:seed || true

echo "==> Starting stack"
docker compose -f docker-compose.prod.yml up -d

echo ""
echo "Deploy complete."
echo "  Public:  http://localhost:${HTTP_PORT:-80}  (or https if certs + SSL_REDIRECT=1)"
echo "  Admin:   /admin"
echo "  Health:  /health"
echo ""
echo "Run ./scripts/smoke-prod.sh to verify endpoints."
