#!/usr/bin/env bash
# KangBa Power User QA — bash (Git Bash / WSL / Linux / macOS)
# Usage: ./scripts/power-user-qa.sh [--prod] [--deploy]
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

PROD=0
DEPLOY=0
for arg in "$@"; do
  case "$arg" in
    --prod) PROD=1 ;;
    --deploy) DEPLOY=1 ;;
  esac
done

if [[ -f .env ]]; then set -a; source .env; set +a; fi

if [[ "$PROD" -eq 1 ]]; then
  WEB_BASE="${SMOKE_BASE_URL:-http://localhost}"
  API_BASE="$WEB_BASE"
  ADMIN_BASE="$WEB_BASE/admin"
else
  WEB_BASE="${WEB_BASE:-http://127.0.0.1:3000}"
  API_BASE="${API_BASE:-http://127.0.0.1:4000}"
  ADMIN_BASE="${ADMIN_BASE:-http://127.0.0.1:3001}"
fi

POWER_EMAIL="${QA_POWER_EMAIL:-poweruser@kangba.local}"
LOCALE="${QA_LOCALE:-en}"
FAILURES=0

ok() { echo "  OK $*"; }
fail() { echo "  FAIL $*"; FAILURES=$((FAILURES + 1)); }

curl_ok() {
  local label="$1" url="$2"
  local code
  code=$(curl -sS -o /dev/null -w "%{http_code}" "$url" 2>/dev/null || echo "000")
  if [[ "$code" =~ ^(200|301|302|307)$ ]]; then ok "$code $label"; else fail "$code $label ($url)"; fi
}

api() {
  local method="$1" path="$2"
  local data="${3:-}"
  local auth=() body=()
  [[ -n "${TOKEN:-}" ]] && auth=(-H "Authorization: Bearer $TOKEN")
  [[ -n "${ADMIN_KEY:-}" ]] && auth=(-H "X-Admin-Key: $ADMIN_KEY")
  if [[ "$method" != "GET" && -n "$data" ]]; then
    body=(-H "Content-Type: application/json" -d "$data")
  fi
  curl -sS "${auth[@]}" "${body[@]}" -X "$method" "${API_BASE}${path}"
}

echo "==> KangBa Power User QA"
echo "    Web: $WEB_BASE | API: $API_BASE | Admin: $ADMIN_BASE"

if [[ "$DEPLOY" -eq 1 ]]; then
  echo "==> Deploy"
  ./scripts/deploy.sh || fail "deploy"
fi

echo "==> Health"
curl_ok "API /health" "$API_BASE/health"
curl_ok "Web /en" "$WEB_BASE/en"

LOCALES=(en zh ko ja ar)
PATHS=(/lore /lore/factions/necropolis-dominion /events /events/hollow-king-awakening /campaigns/hollow-king-awakening)
echo "==> Locale pages"
for loc in "${LOCALES[@]}"; do
  for p in "${PATHS[@]}"; do
    curl_ok "${loc}${p}" "$WEB_BASE/${loc}${p}" || true
  done
done

echo "==> Admin logins"
ADMIN_TOKEN=""
for pair in \
  "admin@kangba.local:kangba-admin-change-me" \
  "editor@kangba.local:kangba-editor-change-me" \
  "viewer@kangba.local:kangba-viewer-change-me"; do
  email="${pair%%:*}"
  pass="${pair#*:}"
  resp=$(curl -sS -X POST "$API_BASE/api/admin/auth/login" \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"$email\",\"password\":\"$pass\"}" || echo '{}')
  tok=$(echo "$resp" | node -e "let d='';process.stdin.on('data',c=>d+=c);process.stdin.on('end',()=>{try{console.log(JSON.parse(d).data?.token||'')}catch{}})" 2>/dev/null || true)
  if [[ -n "$tok" ]]; then ok "admin $email"; ADMIN_TOKEN="${ADMIN_TOKEN:-$tok}"; else fail "admin $email"; fi
done

echo "==> Power user (email OTP)"
TOKEN=""
USER_ID=""
api POST "/api/login/email/request" "{\"email\":\"$POWER_EMAIL\"}" >/dev/null || true
sleep 1
CODE=$(cd server && pnpm exec dotenv -e ../.env -- tsx ../scripts/qa-get-email-code.ts "$POWER_EMAIL" 2>/dev/null | tr -d '\r\n' || true)
if [[ -z "$CODE" ]]; then
  fail "verification code for $POWER_EMAIL"
else
  sess=$(api POST "/api/login/email/verify" "{\"email\":\"$POWER_EMAIL\",\"code\":\"$CODE\"}")
  TOKEN=$(echo "$sess" | node -e "let d='';process.stdin.on('data',c=>d+=c);process.stdin.on('end',()=>{try{const j=JSON.parse(d);console.log(j.data?.accessToken||'')}catch{}})" 2>/dev/null || true)
  USER_ID=$(echo "$sess" | node -e "let d='';process.stdin.on('data',c=>d+=c);process.stdin.on('end',()=>{try{console.log(JSON.parse(d).data?.user?.id||'')}catch{}})" 2>/dev/null || true)
  if [[ -n "$TOKEN" ]]; then ok "JWT $POWER_EMAIL"; else fail "email verify"; fi
fi

if [[ -n "$TOKEN" ]]; then
  echo "==> Engagement"
  api POST "/api/signin/claim" "{}" | node -e "let d='';process.stdin.on('data',c=>d+=c);process.stdin.on('end',()=>{try{const x=JSON.parse(d).data;console.log('  signin +'+x.rewardPoints+' pts')}catch{}})" 2>/dev/null || true

  tasks=$(api GET "/api/tasks")
  echo "$tasks" | node -e "
    let d='';process.stdin.on('data',c=>d+=c);process.stdin.on('end',()=>{
      try{(JSON.parse(d).data||[]).filter(t=>!t.completed).forEach(t=>console.log(t.id))}catch{}
    })" 2>/dev/null | while read -r tid; do
    [[ -z "$tid" ]] && continue
    api POST "/api/tasks/complete" "{\"taskId\":\"$tid\"}" >/dev/null && ok "task $tid" || true
  done

  ev=$(api GET "/api/events/hollow-king-awakening?locale=$LOCALE")
  echo "$ev" | node -e "
    let d='';process.stdin.on('data',c=>d+=c);process.stdin.on('end',()=>{
      try{(JSON.parse(d).data?.event?.tasks||[]).forEach(t=>console.log(t.id))}catch{}
    })" 2>/dev/null | while read -r tid; do
    [[ -z "$tid" ]] && continue
    api POST "/api/events/hollow-king-awakening/advance?locale=$LOCALE" "{\"taskId\":\"$tid\"}" >/dev/null && ok "event $tid" || true
  done

  camp=$(api GET "/api/campaigns/hollow-king-awakening?locale=$LOCALE")
  echo "$camp" | node -e "
    let d='';process.stdin.on('data',c=>d+=c);process.stdin.on('end',()=>{
      try{(JSON.parse(d).data?.campaign?.quests||[]).forEach(q=>console.log(q.id))}catch{}
    })" 2>/dev/null | while read -r qid; do
    [[ -z "$qid" ]] && continue
    api POST "/api/campaigns/hollow-king-awakening/advance?locale=$LOCALE" "{\"questId\":\"$qid\"}" >/dev/null && ok "quest $qid" || true
  done

  [[ -n "$USER_ID" ]] && api GET "/api/profile/$USER_ID" >/dev/null && ok "profile $USER_ID" || true
  api GET "/api/community/me" >/dev/null && ok "community/me" || true
fi

echo "==> Admin API"
if [[ -n "${ADMIN_API_KEY:-}" ]]; then ADMIN_KEY="$ADMIN_API_KEY"; elif [[ -n "$ADMIN_TOKEN" ]]; then
  TOKEN="$ADMIN_TOKEN"
fi
if [[ -n "${ADMIN_KEY:-}" ]] || [[ -n "${ADMIN_TOKEN:-}" ]]; then
  api GET "/api/admin/events/export" >/dev/null && ok "events export" || true
  api GET "/api/admin/community" >/dev/null && ok "community admin" || true
  api GET "/api/admin/monitoring" >/dev/null && ok "monitoring" || true
fi

echo ""
if [[ "$FAILURES" -eq 0 ]]; then echo "Power User QA completed — all critical checks passed."; exit 0
else echo "Power User QA completed with $FAILURES critical failure(s)."; exit 1; fi
