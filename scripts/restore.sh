#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
DUMP="${1:?Usage: ./scripts/restore.sh path/to/KENBA_YYYYMMDD.dump}"

source .env 2>/dev/null || true
: "${DATABASE_URL:?DATABASE_URL required}"

echo "WARNING: This will overwrite the current database."
read -r -p "Continue? [y/N] " ans
[[ "$ans" == "y" || "$ans" == "Y" ]] || exit 0

pg_restore --clean --if-exists --no-owner -d "$DATABASE_URL" "$DUMP"
echo "Restore complete."
