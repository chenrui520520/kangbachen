import path from "node:path";
import { fileURLToPath } from "node:url";

const serverRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");

export function getStorageRoot(): string {
  return process.env.STORAGE_PATH ?? path.join(serverRoot, "..", "storage");
}

export function getImagesDir(category?: string): string {
  const base = path.join(getStorageRoot(), "images");
  if (!category) return base;
  const safe = category.replace(/[^a-z0-9-_]/gi, "");
  return path.join(base, safe || "illustrations");
}
