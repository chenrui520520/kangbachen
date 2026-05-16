import type { FastifyReply, FastifyRequest } from "fastify";
import { leaderboardQuerySchema } from "../schemas/engagement.js";
import { adminExportQuerySchema, adminPaginationSchema } from "../schemas/admin.js";
import { sendSuccess } from "../utils/response.js";
import { adminService } from "../services/admin.service.js";
import { auditService } from "../services/audit.service.js";
import { getRedis } from "../services/redis.js";
import { prisma } from "../services/prisma.js";

export const adminController = {
  exportRewards: (req: FastifyRequest, reply: FastifyReply) => {
    const query = adminExportQuerySchema.parse(req.query);
    return sendSuccess(reply, 200, adminService.exportRewardsFile(query.format, query.persist ?? false));
  },

  exportLeaderboard: (req: FastifyRequest, reply: FastifyReply) => {
    const typeQuery = leaderboardQuerySchema.parse(req.query);
    const query = adminExportQuerySchema.parse(req.query);
    return sendSuccess(
      reply,
      200,
      adminService.exportLeaderboardFile(typeQuery.type, query.format, query.persist ?? false),
    );
  },

  exportPoints: (req: FastifyRequest, reply: FastifyReply) => {
    const query = adminExportQuerySchema.parse(req.query);
    return sendSuccess(reply, 200, adminService.exportPoints(query.format, query.persist ?? false));
  },

  exportReferrals: (req: FastifyRequest, reply: FastifyReply) => {
    const query = adminExportQuerySchema.parse(req.query);
    return sendSuccess(reply, 200, adminService.exportReferrals(query.format, query.persist ?? false));
  },

  userStats: (req: FastifyRequest, reply: FastifyReply) =>
    sendSuccess(reply, 200, adminService.userActivityStats()),

  systemStatus: async (_req: FastifyRequest, reply: FastifyReply) => {
    const redis = getRedis();
    let redisOk = false;
    try {
      redisOk = (await redis.ping()) === "PONG";
    } catch {
      redisOk = false;
    }
    let dbOk = false;
    try {
      await prisma.$queryRaw`SELECT 1`;
      dbOk = true;
    } catch {
      dbOk = false;
    }
    return sendSuccess(reply, 200, {
      status: dbOk && redisOk ? "healthy" : "degraded",
      database: dbOk,
      redis: redisOk,
      uptimeSec: Math.floor(process.uptime()),
      nodeVersion: process.version,
      timestamp: new Date().toISOString(),
    });
  },

  auditLogs: (req: FastifyRequest, reply: FastifyReply) => {
    const query = adminPaginationSchema.parse(req.query);
    return sendSuccess(reply, 200, auditService.list(query.page, query.limit));
  },

  listUsers: (req: FastifyRequest, reply: FastifyReply) => {
    const query = adminPaginationSchema.parse(req.query);
    return sendSuccess(reply, 200, adminService.listUsers(query.page, query.limit, query.search));
  },

  listReferrals: (req: FastifyRequest, reply: FastifyReply) => {
    const query = adminPaginationSchema.parse(req.query);
    return sendSuccess(reply, 200, adminService.listReferrals(query.page, query.limit));
  },

  listEvents: (req: FastifyRequest, reply: FastifyReply) => {
    return sendSuccess(reply, 200, adminService.listEvents());
  },

  listShop: (req: FastifyRequest, reply: FastifyReply) => {
    return sendSuccess(reply, 200, adminService.listShopItems());
  },
};
