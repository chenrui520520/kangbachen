import { z } from "zod";

export const adminPaginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().optional(),
});

export const adminExportQuerySchema = z.object({
  format: z.enum(["json", "csv"]).default("json"),
  persist: z
    .enum(["true", "false"])
    .optional()
    .transform((v) => v === "true"),
});
