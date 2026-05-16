import type { FastifyReply, FastifyRequest } from "fastify";
import { loreService } from "../services/lore.service.js";
import { sendSuccess } from "../utils/response.js";
import { localeQuerySchema } from "../schemas/phase6.js";

export const lorePublicController = {
  world: async (req: FastifyRequest, reply: FastifyReply) => {
    const locale = localeQuerySchema.parse((req.query as { locale?: string }).locale ?? "en");
    return sendSuccess(reply, 200, await loreService.getWorld(locale));
  },

  region: async (req: FastifyRequest, reply: FastifyReply) => {
    const { slug } = req.params as { slug: string };
    const locale = localeQuerySchema.parse((req.query as { locale?: string }).locale ?? "en");
    return sendSuccess(reply, 200, await loreService.getRegion(slug, locale));
  },

  faction: async (req: FastifyRequest, reply: FastifyReply) => {
    const { slug } = req.params as { slug: string };
    const locale = localeQuerySchema.parse((req.query as { locale?: string }).locale ?? "en");
    return sendSuccess(reply, 200, await loreService.getFaction(slug, locale));
  },

  character: async (req: FastifyRequest, reply: FastifyReply) => {
    const { slug } = req.params as { slug: string };
    const locale = localeQuerySchema.parse((req.query as { locale?: string }).locale ?? "en");
    return sendSuccess(reply, 200, await loreService.getCharacter(slug, locale));
  },

  characters: async (req: FastifyRequest, reply: FastifyReply) => {
    const locale = localeQuerySchema.parse((req.query as { locale?: string }).locale ?? "en");
    return sendSuccess(reply, 200, await loreService.listCharacters(locale));
  },

  creatures: async (req: FastifyRequest, reply: FastifyReply) => {
    const locale = localeQuerySchema.parse((req.query as { locale?: string }).locale ?? "en");
    return sendSuccess(reply, 200, await loreService.listCreatures(locale));
  },

  artifacts: async (req: FastifyRequest, reply: FastifyReply) => {
    const locale = localeQuerySchema.parse((req.query as { locale?: string }).locale ?? "en");
    return sendSuccess(reply, 200, await loreService.listArtifacts(locale));
  },

  timeline: async (req: FastifyRequest, reply: FastifyReply) => {
    const locale = localeQuerySchema.parse((req.query as { locale?: string }).locale ?? "en");
    return sendSuccess(reply, 200, await loreService.getTimeline(locale));
  },
};
