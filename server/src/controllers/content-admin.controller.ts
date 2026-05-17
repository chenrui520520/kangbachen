import type { FastifyReply, FastifyRequest } from "fastify";
import {
  adminAdjustPointsSchema,
  nftRewardAdminSchema,
  shopItemAdminSchema,
  signInRewardConfigSchema,
  taskAdminSchema,
} from "../schemas/admin-content.js";
import { adminService } from "../services/admin.service.js";
import { auditService } from "../services/audit.service.js";
import { cmsService } from "../services/cms.service.js";
import { sendSuccess } from "../utils/response.js";

async function audit(req: FastifyRequest, action: string, resourceId?: string) {
  await auditService.log({
    adminUserId: req.adminAuth?.sub !== "api-key" ? req.adminAuth?.sub : undefined,
    action,
    resource: "Content",
    resourceId,
    ipAddress: req.ip,
    userAgent: req.headers["user-agent"],
  });
}

export const contentAdminController = {
  listShop: async (_req: FastifyRequest, reply: FastifyReply) =>
    sendSuccess(reply, 200, await adminService.listShopItems()),

  saveShop: async (req: FastifyRequest, reply: FastifyReply) => {
    const body = shopItemAdminSchema.parse(req.body);
    const row = await adminService.upsertShopItem(body);
    await audit(req, "SHOP_ITEM_SAVE", row.id);
    return sendSuccess(reply, 200, row);
  },

  listTasks: async (_req: FastifyRequest, reply: FastifyReply) =>
    sendSuccess(reply, 200, await adminService.listTasks()),

  saveTask: async (req: FastifyRequest, reply: FastifyReply) => {
    const body = taskAdminSchema.parse(req.body);
    const row = await adminService.upsertTask(body);
    await audit(req, "TASK_SAVE", row.id);
    return sendSuccess(reply, 200, row);
  },

  listNfts: async (_req: FastifyRequest, reply: FastifyReply) =>
    sendSuccess(reply, 200, await adminService.listNftRewards()),

  saveNft: async (req: FastifyRequest, reply: FastifyReply) => {
    const body = nftRewardAdminSchema.parse(req.body);
    const row = await adminService.upsertNftReward(body);
    await audit(req, "NFT_REWARD_SAVE", row.id);
    return sendSuccess(reply, 200, row);
  },

  listSignInRewards: async (_req: FastifyRequest, reply: FastifyReply) =>
    sendSuccess(reply, 200, await adminService.listSignInRewardConfigs()),

  saveSignInReward: async (req: FastifyRequest, reply: FastifyReply) => {
    const body = signInRewardConfigSchema.parse(req.body);
    const row = await adminService.upsertSignInRewardConfig({
      day: body.day,
      rewardPoints: body.rewardPoints,
      nftRewardId: body.nftRewardId ?? null,
    });
    await audit(req, "SIGNIN_REWARD_SAVE", String(body.day));
    return sendSuccess(reply, 200, row);
  },

  adjustUserPoints: async (req: FastifyRequest, reply: FastifyReply) => {
    const body = adminAdjustPointsSchema.parse(req.body);
    const result = await adminService.adjustUserPoints({
      ...body,
      adminUserId: req.adminAuth?.sub !== "api-key" ? req.adminAuth?.sub : undefined,
    });
    await audit(req, "USER_POINTS_ADJUST", body.userId);
    return sendSuccess(reply, 200, result);
  },

  overview: async (_req: FastifyRequest, reply: FastifyReply) => {
    const [pages, posts, banners, faqs, announcements] = await Promise.all([
      cmsService.listPages(),
      cmsService.listPosts(),
      cmsService.listBanners(),
      cmsService.listFaqs(),
      cmsService.listAnnouncements(),
    ]);
    return sendSuccess(reply, 200, {
      pages: pages.length,
      posts: posts.length,
      banners: banners.length,
      faqs: faqs.length,
      announcements: announcements.length,
    });
  },
};
