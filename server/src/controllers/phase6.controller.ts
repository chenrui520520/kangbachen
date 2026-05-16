import type { FastifyReply, FastifyRequest } from "fastify";
import {
  campaignAdvanceSchema,
  docArticleSchema,
  campaignSchema,
  campaignQuestSchema,
  eventSchema,
  eventTaskSchema,
  eventRewardSchema,
  eventAdvanceSchema,
  communityInviteSchema,
  badgeSchema,
} from "../schemas/phase6.js";
import { localeQuerySchema } from "../schemas/phase6.js";
import { campaignService } from "../services/campaign.service.js";
import { eventService } from "../services/event.service.js";
import { docService } from "../services/doc.service.js";
import { profileService } from "../services/profile.service.js";
import { communityService } from "../services/community.service.js";
import { monitoringService } from "../services/monitoring.service.js";
import { sendSuccess } from "../utils/response.js";
import { getRedis } from "../services/redis.js";
import { prisma } from "../services/prisma.js";
import { auditService } from "../services/audit.service.js";
import { badRequest } from "../errors/http-error.js";

export const campaignPublicController = {
  list: async (req: FastifyRequest, reply: FastifyReply) => {
    const locale = localeQuerySchema.parse((req.query as { locale?: string }).locale ?? "en");
    return sendSuccess(reply, 200, await campaignService.listPublic(locale));
  },

  get: async (req: FastifyRequest, reply: FastifyReply) => {
    const { slug } = req.params as { slug: string };
    const locale = localeQuerySchema.parse((req.query as { locale?: string }).locale ?? "en");
    const userId = req.authUser?.sub;
    return sendSuccess(reply, 200, await campaignService.getCampaign(slug, locale, userId));
  },

  advance: async (req: FastifyRequest, reply: FastifyReply) => {
    const { slug } = req.params as { slug: string };
    const locale = localeQuerySchema.parse((req.query as { locale?: string }).locale ?? "en");
    const body = campaignAdvanceSchema.parse(req.body);
    const userId = req.authUser!.sub;
    return sendSuccess(
      reply,
      200,
      await campaignService.advanceQuest(userId, slug, body.questId, locale),
    );
  },
};

export const docPublicController = {
  list: async (req: FastifyRequest, reply: FastifyReply) => {
    const { category } = req.params as { category: string };
    const locale = localeQuerySchema.parse((req.query as { locale?: string }).locale ?? "en");
    if (!docService.isValidCategory(category)) throw badRequest("Invalid category");
    return sendSuccess(reply, 200, await docService.listCategory(category, locale));
  },

  article: async (req: FastifyRequest, reply: FastifyReply) => {
    const { category, slug } = req.params as { category: string; slug: string };
    const locale = localeQuerySchema.parse((req.query as { locale?: string }).locale ?? "en");
    if (!docService.isValidCategory(category)) throw badRequest("Invalid category");
    return sendSuccess(reply, 200, await docService.getArticle(category, slug, locale));
  },

  search: async (req: FastifyRequest, reply: FastifyReply) => {
    const locale = localeQuerySchema.parse((req.query as { locale?: string }).locale ?? "en");
    const q = String((req.query as { q?: string }).q ?? "");
    return sendSuccess(reply, 200, await docService.search(locale, q));
  },
};

export const profilePublicController = {
  get: async (req: FastifyRequest, reply: FastifyReply) => {
    const { id } = req.params as { id: string };
    return sendSuccess(reply, 200, await profileService.getPublicProfile(id));
  },
};

export const communityController = {
  me: async (req: FastifyRequest, reply: FastifyReply) => {
    const userId = req.authUser!.sub;
    await communityService.syncBadgesAndTier(userId);
    return sendSuccess(reply, 200, await communityService.getCommunity(userId));
  },

  invite: async (req: FastifyRequest, reply: FastifyReply) => {
    const userId = req.authUser!.sub;
    const body = communityInviteSchema.parse(req.body);
    return sendSuccess(reply, 200, await communityService.bindInvite(userId, body.code));
  },
};

export const eventPublicController = {
  list: async (req: FastifyRequest, reply: FastifyReply) => {
    const locale = localeQuerySchema.parse((req.query as { locale?: string }).locale ?? "en");
    const userId = req.authUser?.sub;
    return sendSuccess(reply, 200, await eventService.listPublic(locale, userId));
  },

  get: async (req: FastifyRequest, reply: FastifyReply) => {
    const { slug } = req.params as { slug: string };
    const locale = localeQuerySchema.parse((req.query as { locale?: string }).locale ?? "en");
    const userId = req.authUser?.sub;
    return sendSuccess(reply, 200, await eventService.getEvent(slug, locale, userId));
  },

  advance: async (req: FastifyRequest, reply: FastifyReply) => {
    const { slug } = req.params as { slug: string };
    const locale = localeQuerySchema.parse((req.query as { locale?: string }).locale ?? "en");
    const body = eventAdvanceSchema.parse(req.body);
    const userId = req.authUser!.sub;
    return sendSuccess(
      reply,
      200,
      await eventService.advanceTask(userId, slug, body.taskId, locale),
    );
  },
};

export const eventAdminController = {
  list: async (_req: FastifyRequest, reply: FastifyReply) =>
    sendSuccess(reply, 200, await eventService.adminList()),

  saveEvent: async (req: FastifyRequest, reply: FastifyReply) => {
    const body = eventSchema.parse(req.body);
    return sendSuccess(reply, 200, await eventService.adminUpsertEvent(body));
  },

  saveTask: async (req: FastifyRequest, reply: FastifyReply) => {
    const body = eventTaskSchema.parse(req.body);
    return sendSuccess(reply, 200, await eventService.adminUpsertTask(body));
  },

  saveReward: async (req: FastifyRequest, reply: FastifyReply) => {
    const body = eventRewardSchema.parse(req.body);
    return sendSuccess(reply, 200, await eventService.adminUpsertReward(body));
  },

  exportStats: async (req: FastifyRequest, reply: FastifyReply) => {
    const eventSlug = (req.query as { eventSlug?: string }).eventSlug;
    return sendSuccess(reply, 200, await eventService.adminExportStats(eventSlug));
  },
};

export const communityAdminController = {
  overview: async (_req: FastifyRequest, reply: FastifyReply) =>
    sendSuccess(reply, 200, await communityService.adminOverview()),

  saveBadge: async (req: FastifyRequest, reply: FastifyReply) => {
    const body = badgeSchema.parse(req.body);
    return sendSuccess(reply, 200, await communityService.adminUpsertBadge(body));
  },
};

export const monitoringAdminController = {
  dashboard: async (_req: FastifyRequest, reply: FastifyReply) => {
    const redis = getRedis();
    let redisOk = false;
    let redisInfo: Record<string, string> = {};
    try {
      redisOk = (await redis.ping()) === "PONG";
      const info = await redis.info("stats");
      const lines = info.split("\n").filter((l) => l.includes(":"));
      for (const line of lines.slice(0, 8)) {
        const [k, v] = line.split(":");
        if (k && v) redisInfo[k.trim()] = v.trim();
      }
    } catch {
      redisOk = false;
    }

    let dbOk = false;
    let userCount = 0;
    try {
      await prisma.$queryRaw`SELECT 1`;
      dbOk = true;
      userCount = await prisma.user.count({ where: { deletedAt: null } });
    } catch {
      dbOk = false;
    }

    return sendSuccess(reply, 200, {
      status: dbOk && redisOk ? "healthy" : "degraded",
      database: { ok: dbOk, users: userCount },
      redis: { ok: redisOk, stats: redisInfo },
      uptimeSec: Math.floor(process.uptime()),
      metrics: monitoringService.getSnapshot(),
      timestamp: new Date().toISOString(),
    });
  },
};

export const docAdminController = {
  list: async (_req: FastifyRequest, reply: FastifyReply) =>
    sendSuccess(reply, 200, await docService.adminList()),

  save: async (req: FastifyRequest, reply: FastifyReply) => {
    const body = docArticleSchema.parse(req.body);
    const row = await docService.adminUpsert(body);
    await docService.invalidateCache(body.category, body.locale);
    await auditService.log({
      adminUserId: req.adminAuth?.sub !== "api-key" ? req.adminAuth?.sub : undefined,
      action: "DOC_SAVE",
      resource: "DocArticle",
      resourceId: row.id,
      ipAddress: req.ip,
    });
    return sendSuccess(reply, 200, row);
  },

  delete: async (req: FastifyRequest, reply: FastifyReply) => {
    const { id } = req.params as { id: string };
    await docService.adminDelete(id);
    await docService.invalidateCache();
    return sendSuccess(reply, 200, { deleted: true });
  },
};

export const campaignAdminController = {
  list: async (_req: FastifyRequest, reply: FastifyReply) =>
    sendSuccess(reply, 200, await campaignService.adminList()),

  saveCampaign: async (req: FastifyRequest, reply: FastifyReply) => {
    const body = campaignSchema.parse(req.body);
    const row = await campaignService.adminUpsertCampaign(body);
    return sendSuccess(reply, 200, row);
  },

  saveQuest: async (req: FastifyRequest, reply: FastifyReply) => {
    const body = campaignQuestSchema.parse(req.body);
    const row = await campaignService.adminUpsertQuest(body);
    return sendSuccess(reply, 200, row);
  },
};
