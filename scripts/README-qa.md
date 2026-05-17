# KENBA QA scripts

## One command (dev stack)

Prerequisites:

1. Postgres + Redis: `docker compose up -d`
2. Schema: `cd server && pnpm exec dotenv -e ../.env -- prisma migrate deploy && prisma db push`
3. Seed: `pnpm db:seed`
4. Dev servers: `pnpm dev` (web :3000, api :4000, admin :3001)

Run:

```bash
pnpm qa:power
```

API-only (when web is down but API is up):

```bash
pnpm qa:power:api
```

Production (nginx on :80):

```bash
pnpm qa:power:prod
# or with deploy first:
powershell -File scripts/power-user-qa.ps1 -Prod -SkipDeploy:$false
```

## What it tests

- API `/health`, optional web locale pages
- Admin logins (SUPERADMIN / EDITOR / VIEWER)
- Power user email OTP → JWT (`poweruser@KENBA.local`, code from DB)
- Sign-in claim, tasks, event quests, campaign quests
- Profile, community, admin export/monitoring

## Fixes vs original bash snippet

| Issue | Fix |
|-------|-----|
| Password login | KENBA uses **email OTP** (`/api/login/email/request` + verify) |
| `accessToken` not `token` | Script uses `data.accessToken` |
| Admin on :3001 | Admin API is on **:4000** `/api/admin/*` |
| `/api/profile/me` | Use `/api/auth/me` + `/api/profile/:id` |
| Events export CSV | Use `/api/admin/events/export` (JSON stats) |

## Bash (Git Bash / WSL)

```bash
chmod +x scripts/power-user-qa.sh
./scripts/power-user-qa.sh
./scripts/power-user-qa.sh --prod --deploy
```
