import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const serverRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const defaultExportsDir = path.join(serverRoot, "..", "storage", "exports");

export type ExportFormat = "json" | "csv";

function toCsv(rows: Record<string, unknown>[]): string {
  if (rows.length === 0) return "";
  const headers = Object.keys(rows[0]!);
  const lines = [
    headers.join(","),
    ...rows.map((row) =>
      headers
        .map((h) => {
          const v = row[h];
          const s = v == null ? "" : String(v);
          return s.includes(",") || s.includes('"') ? `"${s.replace(/"/g, '""')}"` : s;
        })
        .join(","),
    ),
  ];
  return lines.join("\n");
}

export const exportFileService = {
  getExportsDir() {
    return process.env.STORAGE_PATH
      ? path.join(process.env.STORAGE_PATH, "exports")
      : defaultExportsDir;
  },

  async writeExport(
    name: string,
    data: unknown,
    format: ExportFormat = "json",
  ): Promise<{ filename: string; path: string; format: ExportFormat }> {
    const dir = this.getExportsDir();
    await mkdir(dir, { recursive: true });

    const stamp = new Date().toISOString().replace(/[:.]/g, "-");
    const filename = `${name}-${stamp}.${format}`;
    const filePath = path.join(dir, filename);

    if (format === "csv" && Array.isArray(data)) {
      await writeFile(filePath, toCsv(data as Record<string, unknown>[]), "utf8");
    } else {
      await writeFile(filePath, JSON.stringify(data, null, 2), "utf8");
    }

    return { filename, path: filePath, format };
  },
};
