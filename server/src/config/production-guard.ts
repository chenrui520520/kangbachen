const WEAK_SECRETS = new Set([
  "KENBA-secret",
  "secret",
  "changeme",
  "dev-admin-key",
  "dev-admin-key-change-in-production",
]);

const WEAK_PASSWORD_FRAGMENTS = ["change-me", "password", "admin123", "12345678"];

export type LaunchCheckIssue = { level: "error" | "warn"; message: string };

function isWeakSecret(value: string | undefined, minLength = 32): boolean {
  if (!value || value.length < minLength) return true;
  const lower = value.toLowerCase();
  if (WEAK_SECRETS.has(lower)) return true;
  if (/^dev-|^test-|^demo/i.test(value)) return true;
  return false;
}

export function validateProductionEnv(env: NodeJS.ProcessEnv = process.env): LaunchCheckIssue[] {
  if ((env.NODE_ENV ?? "development") !== "production") return [];

  const issues: LaunchCheckIssue[] = [];

  if (isWeakSecret(env.JWT_SECRET)) {
    issues.push({ level: "error", message: "JWT_SECRET 须至少 32 位且非默认值" });
  }

  if (isWeakSecret(env.ADMIN_API_KEY, 24)) {
    issues.push({ level: "error", message: "ADMIN_API_KEY 须设置为强随机密钥（≥24 位）" });
  }

  if (env.MOCK_SMTP !== "false") {
    issues.push({
      level: "warn",
      message: "登录已使用 OAuth；若仍启用验证码邮箱登录，请设置 MOCK_SMTP=false 并配置 SMTP",
    });
  } else {
    if (!env.SMTP_HOST) issues.push({ level: "warn", message: "MOCK_SMTP=false 但未设置 SMTP_HOST" });
    if (!env.SMTP_FROM) issues.push({ level: "warn", message: "MOCK_SMTP=false 但未设置 SMTP_FROM" });
  }

  if (!process.env.GOOGLE_CLIENT_ID?.trim()) {
    issues.push({ level: "warn", message: "未配置 GOOGLE_CLIENT_ID，邮箱一键登录不可用" });
  }
  if (!process.env.TWITTER_CLIENT_ID?.trim()) {
    issues.push({ level: "warn", message: "未配置 TWITTER_CLIENT_ID，X 一键登录不可用" });
  }

  if (!env.CORS_ORIGINS || env.CORS_ORIGINS.includes("localhost")) {
    issues.push({
      level: "warn",
      message: "CORS_ORIGINS 应设为生产域名，勿包含 localhost",
    });
  }

  const db = env.DATABASE_URL ?? "";
  if (db.includes("postgres:postgres@") || db.includes("password@localhost")) {
    issues.push({ level: "error", message: "DATABASE_URL 不得使用默认弱数据库密码" });
  }

  for (const key of ["ADMIN_SEED_PASSWORD", "ADMIN_EDITOR_PASSWORD", "ADMIN_VIEWER_PASSWORD"]) {
    const v = env[key];
    if (v && WEAK_PASSWORD_FRAGMENTS.some((f) => v.includes(f))) {
      issues.push({ level: "error", message: `${key} 仍为示例弱密码，请修改` });
    }
  }

  return issues;
}

/** Validates environment before public beta. Throws on blocking errors in production. */
export function assertProductionReady(env: NodeJS.ProcessEnv = process.env): void {
  const issues = validateProductionEnv(env);
  const errors = issues.filter((i) => i.level === "error");
  if (errors.length > 0) {
    const msg = errors.map((e) => `- ${e.message}`).join("\n");
    throw new Error(`Production environment check failed:\n${msg}`);
  }

  for (const w of issues.filter((i) => i.level === "warn")) {
    // eslint-disable-next-line no-console
    console.warn(`[launch] ${w.message}`);
  }
}
