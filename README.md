# KENBA

Monorepo for the KENBA Web3 game official site. Technical source of truth: [`PRDs/development.md`](PRDs/development.md).

> **Note:** Branding is **KENBA**; the Postgres database name and Docker network remain `kangba` so existing local/production data volumes keep working. API paths are unchanged (`/api/...`).

## Prerequisites

- Node.js 22+
- [pnpm](https://pnpm.io/) 9 (`corepack enable` then `corepack prepare pnpm@9.15.0 --activate`, or install pnpm globally)
- Docker Desktop (for Postgres + Redis, and optional full stack)

If your terminal cannot find `pnpm` or `npx`, ensure the Node.js install directory (for example `C:\\Program Files\\nodejs\\`) is on your `PATH`, then re-open the shell.

## Quick start (stability-first default)

**完整上线清单（含 Google / X OAuth 逐步配置）见：[docs/MANUAL_SETUP.zh.md](docs/MANUAL_SETUP.zh.md)**

1. Copy environment file and fill `NEXT_PUBLIC_WC_PROJECT_ID` for WalletConnect:

   ```bash
   cp .env.example .env
   # 或：pnpm setup:env
   ```

2. Start **only** Postgres and Redis:

   ```bash
   docker compose up -d
   ```

3. Install dependencies and run database migrations:

   ```bash
   pnpm install
   pnpm db:migrate
   ```

4. Run Next.js (`apps/web`) and Fastify (`server`) on the host:

   ```bash
   pnpm dev
   ```

   OAuth 配置检查：`pnpm oauth:check`（本地未配密钥时可用 `OAUTH_DEV_MOCK=true` 模拟登录）

5. (Optional) Run the admin shell on port **3001**:

   ```bash
   pnpm dev:admin
   ```

- Web: [http://localhost:3000](http://localhost:3000) (locale prefix, e.g. `/en`)
- Admin: [http://localhost:3001/admin](http://localhost:3001/admin) (note the `basePath`)
- API: [http://127.0.0.1:4000/health](http://127.0.0.1:4000/health)
- Next health proxy: [http://localhost:3000/api/health](http://localhost:3000/api/health)

## Full stack (Docker: web + api + postgres + redis)

Used for production-like checks and CI:

```bash
docker compose -f docker-compose.full.yml up --build
```

- `migrate` runs once, `api` becomes healthy before `web` starts, and both `api` / `web` have Docker healthchecks.

## Workspace layout

| Path | Role |
|------|------|
| `apps/web` | Public Next.js 15 site |
| `apps/admin` | Admin shell (Next.js) |
| `server` | Fastify API + Prisma |
| `packages/*` | Shared config, types, utils, ui |
| `storage/` | Local media and exports (mounted into API in full compose) |

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Run web + API in parallel |
| `pnpm dev:admin` | Run admin (`basePath=/admin`) on port 3001 |
| `pnpm db:migrate` | Prisma migrate (dev workflow) |
| `pnpm --filter api prisma:generate` | `prisma generate` (e.g. after schema changes) |
| `pnpm build` | Build all packages that define `build` |

## Notes

- **WalletConnect** uses Reown (WalletConnect Cloud) for relay; this is not end-user auth (JWT/email/X remain self-hosted per PRD). Configure `NEXT_PUBLIC_WC_PROJECT_ID` locally.
- **shadcn/ui** is initialized under `apps/web`; use the shadcn CLI to add components (do not use deprecated `shadcn-ui` npm package from older docs).
