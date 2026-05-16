#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

BASE="${SMOKE_BASE_URL:-http://localhost}"
LOCALES=(en ko ja ar)

echo "==> Smoke test against $BASE"

check() {
  local path="$1"
  local code
  code=$(curl -sS -o /dev/null -w "%{http_code}" "$BASE$path" || echo "000")
  if [[ "$code" =~ ^(200|301|302|307)$ ]]; then
    echo "  OK $code $path"
  else
    echo "  FAIL $code $path"
    return 1
  fi
}

check /health
check /admin

for loc in "${LOCALES[@]}"; do
  check "/$loc/lore"
  check "/$loc/events"
  check "/$loc/campaigns/hollow-king-awakening"
  check "/$loc/events/hollow-king-awakening"
done

echo "==> API events (public)"
code=$(curl -sS -o /dev/null -w "%{http_code}" "$BASE/api/events?locale=en" || echo "000")
echo "  events list: $code"

echo "Smoke complete."
