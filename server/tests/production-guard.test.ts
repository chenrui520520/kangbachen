import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { assertProductionReady, validateProductionEnv } from "../src/config/production-guard.js";

const prodBase: NodeJS.ProcessEnv = {
  NODE_ENV: "production",
  JWT_SECRET: "a".repeat(48),
  ADMIN_API_KEY: "b".repeat(32),
  MOCK_SMTP: "false",
  SMTP_HOST: "smtp.example.com",
  SMTP_FROM: "noreply@example.com",
  DATABASE_URL: "postgresql://app:strongpass@db:5432/KENBA",
  CORS_ORIGINS: "https://KENBA.example.com",
  ADMIN_SEED_PASSWORD: "SuperSecure!Pass2026",
};

describe("production-guard", () => {
  it("allows valid production env", () => {
    assert.equal(validateProductionEnv(prodBase).filter((i) => i.level === "error").length, 0);
    assert.doesNotThrow(() => assertProductionReady(prodBase));
  });

  it("rejects weak JWT_SECRET", () => {
    const issues = validateProductionEnv({ ...prodBase, JWT_SECRET: "KENBA-secret" });
    assert.ok(issues.some((i) => i.message.includes("JWT_SECRET")));
  });

  it("warns when MOCK_SMTP in production", () => {
    const issues = validateProductionEnv({ ...prodBase, MOCK_SMTP: "true" });
    assert.ok(issues.some((i) => i.level === "warn" && i.message.includes("OAuth")));
  });

  it("skips checks in development", () => {
    assert.equal(validateProductionEnv({ NODE_ENV: "development" }).length, 0);
  });
});
