import type { FastifyReply, FastifyRequest } from "fastify";
import {
  cmsAnnouncementSchema,
  cmsBannerSchema,
  cmsFaqSchema,
  cmsPageSchema,
  cmsPostSchema,
} from "../schemas/cms.js";
import { cmsService } from "../services/cms.service.js";
import { auditService } from "../services/audit.service.js";
import { sendSuccess } from "../utils/response.js";

async function audit(req: FastifyRequest, action: string, resource: string, resourceId?: string) {
  await auditService.log({
    adminUserId: req.adminAuth?.sub !== "api-key" ? req.adminAuth?.sub : undefined,
    action,
    resource,
    resourceId,
    ipAddress: req.ip,
    userAgent: req.headers["user-agent"],
  });
}

export const cmsAdminController = {
  listPages: async (_req: FastifyRequest, reply: FastifyReply) =>
    sendSuccess(reply, 200, await cmsService.listPages()),

  savePage: async (req: FastifyRequest, reply: FastifyReply) => {
    const body = cmsPageSchema.parse(req.body);
    const row = await cmsService.upsertPage(body);
    await cmsService.invalidateCache(body.locale);
    await audit(req, "CMS_PAGE_SAVE", "CmsPage", row.id);
    return sendSuccess(reply, 200, row);
  },

  listPosts: async (_req: FastifyRequest, reply: FastifyReply) =>
    sendSuccess(reply, 200, await cmsService.listPosts()),

  savePost: async (req: FastifyRequest, reply: FastifyReply) => {
    const body = cmsPostSchema.parse(req.body);
    const row = await cmsService.upsertPost(body);
    await cmsService.invalidateCache(body.locale);
    await audit(req, "CMS_POST_SAVE", "CmsPost", row.id);
    return sendSuccess(reply, 200, row);
  },

  listBanners: async (_req: FastifyRequest, reply: FastifyReply) =>
    sendSuccess(reply, 200, await cmsService.listBanners()),

  saveBanner: async (req: FastifyRequest, reply: FastifyReply) => {
    const body = cmsBannerSchema.parse(req.body);
    const row = await cmsService.upsertBanner(body);
    await cmsService.invalidateCache(body.locale);
    await audit(req, "CMS_BANNER_SAVE", "CmsBanner", row.id);
    return sendSuccess(reply, 200, row);
  },

  listFaqs: async (_req: FastifyRequest, reply: FastifyReply) =>
    sendSuccess(reply, 200, await cmsService.listFaqs()),

  saveFaq: async (req: FastifyRequest, reply: FastifyReply) => {
    const body = cmsFaqSchema.parse(req.body);
    const row = await cmsService.upsertFaq(body);
    await cmsService.invalidateCache(body.locale);
    await audit(req, "CMS_FAQ_SAVE", "CmsFaq", row.id);
    return sendSuccess(reply, 200, row);
  },

  listAnnouncements: async (_req: FastifyRequest, reply: FastifyReply) =>
    sendSuccess(reply, 200, await cmsService.listAnnouncements()),

  saveAnnouncement: async (req: FastifyRequest, reply: FastifyReply) => {
    const body = cmsAnnouncementSchema.parse(req.body);
    const row = await cmsService.upsertAnnouncement(body);
    await cmsService.invalidateCache(body.locale);
    await audit(req, "CMS_ANNOUNCEMENT_SAVE", "CmsAnnouncement", row.id);
    return sendSuccess(reply, 200, row);
  },

  delete: async (req: FastifyRequest, reply: FastifyReply) => {
    const { kind, id } = req.params as { kind: "page" | "post" | "banner" | "faq" | "announcement"; id: string };
    await cmsService.delete(kind, id);
    await cmsService.invalidateCache();
    await audit(req, "CMS_DELETE", kind, id);
    return sendSuccess(reply, 200, { deleted: true });
  },
};
