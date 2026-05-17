import { config } from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadOAuthConfig } from "../server/src/config/oauth.js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
config({ path: path.join(root, ".env") });

const cfg = loadOAuthConfig();
const api = cfg.apiPublicUrl;

console.log("=== OAuth 配置检查 ===\n");

if (cfg.google) {
  console.log("[OK] Google OAuth");
  console.log(`     回调: ${cfg.google.redirectUri}`);
} else {
  console.log("[待填] GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET");
  console.log(`     回调应设为: ${api}/api/login/google/callback`);
}

if (cfg.twitter) {
  console.log("[OK] X (Twitter) OAuth");
  console.log(`     回调: ${cfg.twitter.redirectUri}`);
} else {
  console.log("[待填] TWITTER_CLIENT_ID / TWITTER_CLIENT_SECRET");
  console.log(`     回调应设为: ${api}/api/login/twitter/callback`);
}

if (process.env.OAUTH_DEV_MOCK === "true") {
  console.log("\n[INFO] OAUTH_DEV_MOCK=true — 未配置 OAuth 时开发环境可走模拟登录");
}

void (async () => {
  try {
    const res = await fetch(`${api}/api/auth/providers`, { signal: AbortSignal.timeout(3000) });
    if (res.ok) {
      const body = (await res.json()) as { data?: { google: boolean; twitter: boolean } };
      const d = body.data ?? body;
      console.log(`\n[API] providers: google=${(d as { google: boolean }).google} twitter=${(d as { twitter: boolean }).twitter}`);
    }
  } catch {
    console.log("\n[SKIP] API 未启动，先运行 pnpm dev");
  }
})();
