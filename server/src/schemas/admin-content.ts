import { z } from "zod";
import { localeSchema } from "./cms.js";

export const adminChangePasswordSchema = z.object({
  currentPassword: z.string().min(8),
  newPassword: z.string().min(8).max(128),
});

export const shopItemAdminSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1),
  description: z.string().optional(),
  type: z.string().default("points"),
  costPoints: z.coerce.number().int().min(0),
  rewardNftId: z.string().nullable().optional(),
  eventSlug: z.string().optional(),
  stock: z.coerce.number().int().min(0).default(0),
  active: z.boolean().default(true),
});

export const taskAdminSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1),
  description: z.string().optional(),
  type: z.string().min(1),
  category: z.string().default("DAILY"),
  rewardPoints: z.coerce.number().int().min(0).default(0),
  rewardNftId: z.string().nullable().optional(),
  repeatable: z.boolean().default(false),
  cooldownHours: z.coerce.number().int().min(0).nullable().optional(),
  targetProgress: z.coerce.number().int().min(1).default(1),
  active: z.boolean().default(true),
});

export const nftRewardAdminSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1),
  description: z.string().optional(),
  rarity: z.string().default("common"),
  imageUrl: z.string().optional(),
});

export const signInRewardConfigSchema = z.object({
  day: z.coerce.number().int().min(1).max(30),
  rewardPoints: z.coerce.number().int().min(0),
  nftRewardId: z.string().nullable().optional(),
});

export const adminAdjustPointsSchema = z.object({
  userId: z.string().min(1),
  mode: z.enum(["add", "deduct", "set"]),
  amount: z.coerce.number().int().min(0),
  note: z.string().max(500).optional(),
});
