import type { FastifyReply, FastifyRequest } from "fastify";
import { cmsService } from "../services/cms.service.js";
import { sendSuccess } from "../utils/response.js";
import { localeSchema } from "../schemas/cms.js";

export const cmsPublicController = {
  bundle: async (req: FastifyRequest, reply: FastifyReply) => {
    const locale = localeSchema.parse((req.query as { locale?: string }).locale ?? "en");
    return sendSuccess(reply, 200, await cmsService.getPublicBundle(locale));
  },

  page: async (req: FastifyRequest, reply: FastifyReply) => {
    const { slug } = req.params as { slug: string };
    const locale = localeSchema.parse((req.query as { locale?: string }).locale ?? "en");
    return sendSuccess(reply, 200, await cmsService.getPage(slug, locale));
  },

  post: async (req: FastifyRequest, reply: FastifyReply) => {
    const { slug } = req.params as { slug: string };
    const locale = localeSchema.parse((req.query as { locale?: string }).locale ?? "en");
    return sendSuccess(reply, 200, await cmsService.getPost(slug, locale));
  },
};
