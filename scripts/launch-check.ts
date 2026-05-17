/**
 * Pre-launch checklist for public beta. Run: pnpm qa:launch
 */
import { config } from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { validateProductionEnv } from "../server/src/config/production-guard.js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
config({ path: path.join(root, ".env") });
config({ path: path.join(root, ".env.local"), override: true });

const apiUrl = (process.env.API_INTERNAL_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:4000").replace(
  /\/$/,
  "",
);

async function pingHealth(): Promise<{ ok: boolean; detail: string }> {
  try {
    const res = await fetch(`${apiUrl}/health`, { signal: AbortSignal.timeout(5000) });
    if (!res.ok) return { ok: false, detail: `HTTP ${res.status}` };
    const body = (await res.json()) as { status?: string; redis?: string };
    return { ok: body.status === "ok", detail: `status=${body.status} redis=${body.redis}` };
  } catch (e) {
    return { ok: false, detail: e instanceof Error ? e.message : String(e) };
  }
}

async function main() {
  const prev = process.env.NODE_ENV;
  process.env.NODE_ENV = "production";

  console.log("=== KENBA 公开试运营检查 ===\n");

  const issues = validateProductionEnv(process.env);
  const errors = issues.filter((i) => i.level === "error");
  const warns = issues.filter((i) => i.level === "warn");

  if (errors.length === 0) {
    console.log("[OK] 生产环境变量（按 NODE_ENV=production 校验）");
  } else {
    console.log("[FAIL] 生产环境变量：");
    for (const e of errors) console.log(`  - ${e.message}`);
  }

  for (const w of warns) console.log(`[WARN] ${w.message}`);

  const health = await pingHealth();
  if (health.ok) {
    console.log(`[OK] API 健康检查 ${apiUrl}/health (${health.detail})`);
  } else {
    console.log(`[SKIP/FAIL] API 未响应 ${apiUrl}/health — ${health.detail}`);
    console.log("       请先启动 API：pnpm dev:server 或 docker compose up api");
  }

  process.env.NODE_ENV = prev;

  const requiredFiles = [".env", "docker-compose.prod.yml", "docker/nginx.prod.conf"];
  for (const f of requiredFiles) {
    const p = path.join(root, f);
    try {
      const fs = await import("node:fs/promises");
      await fs.access(p);
      console.log(`[OK] 存在 ${f}`);
    } catch {
      console.log(`[WARN] 缺少 ${f}`);
    }
  }

  console.log("\n--- 建议上线前完成 ---");
  console.log("1. 复制 .env.production.example → .env 并填写强密钥与 SMTP");
  console.log("2. docker compose -f docker-compose.prod.yml up -d");
  console.log("3. pnpm db:migrate && pnpm qa:power:prod");
  console.log("4. 定期执行 scripts/backup-db.ps1 备份数据库");
  console.log("5. 后台修改默认管理员密码（账号设置）\n");

  if (errors.length > 0) {
    process.exitCode = 1;
  }
}

void main();
