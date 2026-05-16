import { z } from "zod";

export const leaderboardQuerySchema = z.object({
  type: z.enum(["points", "streak", "nft", "referral"]).default("points"),
});

export const taskCompleteBodySchema = z.object({
  taskId: z.string().min(1),
});

export const shopPurchaseBodySchema = z.object({
  shopItemId: z.string().min(1),
});
