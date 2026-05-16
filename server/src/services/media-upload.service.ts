import { createReadStream } from "node:fs";
import { mkdir, readdir, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { badRequest } from "../errors/http-error.js";
import { getImagesDir, getStorageRoot } from "../utils/storage.js";

const ALLOWED_EXT = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif"]);
const MIME_TO_EXT: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/gif": ".gif",
};
const MAX_BYTES = 5 * 1024 * 1024;
const CATEGORIES = new Set([
  "illustrations",
  "lore",
  "banners",
  "events",
  "campaigns",
  "community",
  "cms",
  "nft",
]);

export type MediaAsset = {
  url: string;
  path: string;
  name: string;
  category: string;
  size: number;
  modifiedAt: string;
};

function normalizeCategory(raw?: string): string {
  const c = (raw ?? "illustrations").toLowerCase().replace(/[^a-z0-9-_]/g, "");
  if (!CATEGORIES.has(c)) return "illustrations";
  return c;
}

function extFromName(filename: string): string {
  return path.extname(filename).toLowerCase();
}

function publicUrl(category: string, filename: string): string {
  return `/storage/images/${category}/${filename}`;
}

export const mediaUploadService = {
  normalizeCategory,

  async saveImage(
    buffer: Buffer,
    opts: { filename: string; mimetype: string; category?: string },
  ): Promise<MediaAsset> {
    if (buffer.length > MAX_BYTES) {
      throw badRequest(`Image must be under ${MAX_BYTES / 1024 / 1024}MB`);
    }

    const category = normalizeCategory(opts.category);
    let ext = extFromName(opts.filename);
    if (!ALLOWED_EXT.has(ext)) {
      ext = MIME_TO_EXT[opts.mimetype] ?? "";
    }
    if (!ext || !ALLOWED_EXT.has(ext)) {
      throw badRequest("Only JPG, PNG, WebP, and GIF images are allowed");
    }

    const dir = getImagesDir(category);
    await mkdir(dir, { recursive: true });

    const safeName = `${Date.now()}-${randomUUID().slice(0, 8)}${ext}`;
    const filePath = path.join(dir, safeName);
    await writeFile(filePath, buffer);

    return {
      url: publicUrl(category, safeName),
      path: filePath,
      name: safeName,
      category,
      size: buffer.length,
      modifiedAt: new Date().toISOString(),
    };
  },

  async listImages(category?: string): Promise<MediaAsset[]> {
    const root = getImagesDir();
    const categories = category
      ? [normalizeCategory(category)]
      : [...CATEGORIES];

    const rows: MediaAsset[] = [];

    for (const cat of categories) {
      const dir = getImagesDir(cat);
      let files: string[] = [];
      try {
        files = await readdir(dir);
      } catch {
        continue;
      }
      for (const name of files) {
        const filePath = path.join(dir, name);
        const info = await stat(filePath);
        if (!info.isFile()) continue;
        const ext = extFromName(name);
        if (!ALLOWED_EXT.has(ext)) continue;
        rows.push({
          url: publicUrl(cat, name),
          path: filePath,
          name,
          category: cat,
          size: info.size,
          modifiedAt: info.mtime.toISOString(),
        });
      }
    }

    return rows.sort((a, b) => b.modifiedAt.localeCompare(a.modifiedAt));
  },

  getStorageRoot,
  createReadStream,
};
