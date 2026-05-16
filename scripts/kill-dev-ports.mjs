import { execSync } from "node:child_process";

try {
  execSync("pnpm exec kill-port 3000 4000", { stdio: "ignore" });
} catch {
  // Ports may already be free or require elevated permissions.
}
