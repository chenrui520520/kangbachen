/**
 * Merge .env.example into .env (keeps existing values). Run: pnpm setup:env
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const examplePath = path.join(root, ".env.example");
const envPath = path.join(root, ".env");

function parseEnv(text) {
  const map = new Map();
  for (const line of text.split(/\r?\n/)) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const i = line.indexOf("=");
    if (i < 1) continue;
    const key = line.slice(0, i).trim();
    map.set(key, line);
  }
  return map;
}

const example = fs.readFileSync(examplePath, "utf8");
const existing = fs.existsSync(envPath) ? fs.readFileSync(envPath, "utf8") : "";
const merged = parseEnv(example);
const current = parseEnv(existing);

for (const [k, line] of current) {
  merged.set(k, line);
}

if (!current.has("JWT_SECRET") || (current.get("JWT_SECRET") ?? "").includes("KENBA-secret")) {
  merged.set("JWT_SECRET", 'JWT_SECRET="KENBA-local-dev-jwt-secret-32b"');
}

const out = [...merged.values()].join("\n") + "\n";
fs.writeFileSync(envPath, out, "utf8");
console.log(`Wrote ${envPath} (${merged.size} keys). Edit OAuth & production secrets before launch.`);
