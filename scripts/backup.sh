#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
BACKUP_DIR="${BACKUP_DIR:-$ROOT/storage/backups}"
mkdir -p "$BACKUP_DIR"
STAMP="$(date +%Y%m%d_%H%M%S)"

source .env 2>/dev/null || true
: "${DATABASE_URL:?DATABASE_URL required}"

echo "==> PostgreSQL dump"
pg_dump "$DATABASE_URL" -Fc -f "$BACKUP_DIR/kangba_${STAMP}.dump"

if [[ -d storage/exports ]] || [[ -d storage/audio ]]; then
  tar -czf "$BACKUP_DIR/storage_${STAMP}.tar.gz" storage/exports storage/videos storage/audio 2>/dev/null || true
fi

echo "Backup saved to $BACKUP_DIR"
