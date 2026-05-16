import { z } from "zod";

export const localeQuerySchema = z.enum(["en", "zh", "ko", "ja", "ar"]).default("en");

export const loreFactionSchema = z.object({
  id: z.string().optional(),
  slug: z.string().min(1),
  locale: z.string().default("en"),
  name: z.string().min(1),
  tagline: z.string().optional(),
  body: z.string().min(1),
  imageUrl: z.string().optional(),
  colorTheme: z.string().optional(),
  motto: z.string().optional(),
  published: z.boolean(),
  sortOrder: z.number().int().optional(),
});

export const loreCharacterSchema = z.object({
  id: z.string().optional(),
  slug: z.string().min(1),
  locale: z.string().default("en"),
  name: z.string().min(1),
  title: z.string().optional(),
  body: z.string().min(1),
  imageUrl: z.string().optional(),
  rarity: z.string().optional(),
  factionId: z.string().optional().nullable(),
  regionId: z.string().optional().nullable(),
  published: z.boolean(),
  metadata: z.record(z.unknown()).optional(),
});

export const loreTimelineSchema = z.object({
  id: z.string().optional(),
  slug: z.string().min(1),
  locale: z.string().default("en"),
  title: z.string().min(1),
  body: z.string().min(1),
  era: z.string().optional(),
  yearLabel: z.string().optional(),
  sortOrder: z.number().int().optional(),
  factionId: z.string().optional().nullable(),
  published: z.boolean(),
});

export const docArticleSchema = z.object({
  id: z.string().optional(),
  slug: z.string().min(1),
  category: z.enum(["litepaper", "docs", "tokenomics", "roadmap", "faq"]),
  locale: z.string().default("en"),
  title: z.string().min(1),
  body: z.string().min(1),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
  published: z.boolean(),
  sortOrder: z.number().int().optional(),
});

export const campaignSchema = z.object({
  id: z.string().optional(),
  slug: z.string().min(1),
  locale: z.string().default("en"),
  name: z.string().min(1),
  description: z.string().optional(),
  narrative: z.string().optional(),
  bannerUrl: z.string().optional(),
  startsAt: z.string(),
  endsAt: z.string(),
  active: z.boolean(),
  featured: z.boolean().optional(),
});

export const campaignQuestSchema = z.object({
  id: z.string().optional(),
  campaignId: z.string(),
  stepOrder: z.number().int(),
  title: z.string().min(1),
  description: z.string().optional(),
  taskKey: z.string().min(1),
  targetProgress: z.number().int().optional(),
  rewardPoints: z.number().int().optional(),
  branchKey: z.string().optional(),
});

export const campaignAdvanceSchema = z.object({
  questId: z.string(),
});

export const eventSchema = z.object({
  id: z.string().optional(),
  slug: z.string().min(1),
  locale: z.string().default("en"),
  name: z.string().min(1),
  description: z.string().optional(),
  startsAt: z.string(),
  endsAt: z.string(),
  multiplier: z.number().optional(),
  bannerUrl: z.string().optional(),
  featured: z.boolean().optional(),
  active: z.boolean(),
});

export const eventTaskSchema = z.object({
  id: z.string().optional(),
  eventId: z.string(),
  stepOrder: z.number().int(),
  title: z.string().min(1),
  description: z.string().optional(),
  taskKey: z.string().min(1),
  targetProgress: z.number().int().optional(),
  rewardPoints: z.number().int().optional(),
  rewardNftId: z.string().nullable().optional(),
});

export const eventRewardSchema = z.object({
  id: z.string().optional(),
  eventId: z.string(),
  milestone: z.number().int(),
  rewardPoints: z.number().int().optional(),
  nftRewardId: z.string().nullable().optional(),
});

export const eventAdvanceSchema = z.object({
  taskId: z.string(),
});

export const communityInviteSchema = z.object({
  code: z.string().min(1),
});

export const badgeSchema = z.object({
  id: z.string().optional(),
  key: z.string().min(1),
  name: z.string().min(1),
  description: z.string().optional(),
  rarity: z.string().default("common"),
  imageUrl: z.string().optional(),
  frameStyle: z.string().optional(),
});
