import { z } from "zod";

export const localeSchema = z.enum(["en", "zh", "ko", "ja", "ar"]).default("en");

export const analyticsTrackSchema = z.object({
  eventType: z.enum([
    "PAGE_VIEW",
    "SIGNIN",
    "TASK_COMPLETE",
    "REFERRAL_BIND",
    "REWARD_CLAIM",
    "SHOP_PURCHASE",
    "LEADERBOARD_VIEW",
  ]),
  sessionId: z.string().max(64).optional(),
  path: z.string().max(512).optional(),
  metadata: z.record(z.unknown()).optional(),
});

export const cmsPageSchema = z.object({
  id: z.string().optional(),
  slug: z.string().min(1).max(120),
  locale: localeSchema,
  title: z.string().min(1),
  body: z.string(),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
  published: z.boolean(),
});

export const cmsPostSchema = cmsPageSchema.extend({
  excerpt: z.string().optional(),
  coverImageUrl: z.string().optional(),
});

export const cmsBannerSchema = z.object({
  id: z.string().optional(),
  locale: localeSchema,
  title: z.string().min(1),
  subtitle: z.string().optional(),
  imageUrl: z.string().optional(),
  linkUrl: z.string().optional(),
  sortOrder: z.coerce.number().int().default(0),
  active: z.boolean(),
});

export const cmsFaqSchema = z.object({
  id: z.string().optional(),
  locale: localeSchema,
  question: z.string().min(1),
  answer: z.string().min(1),
  sortOrder: z.coerce.number().int().default(0),
  published: z.boolean(),
});

export const cmsAnnouncementSchema = z.object({
  id: z.string().optional(),
  locale: localeSchema,
  message: z.string().min(1),
  linkUrl: z.string().optional(),
  active: z.boolean(),
  startsAt: z.coerce.date().optional().nullable(),
  endsAt: z.coerce.date().optional().nullable(),
});

export const adminLoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});
