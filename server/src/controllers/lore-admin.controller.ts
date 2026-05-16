import type { FastifyReply, FastifyRequest } from "fastify";
import { loreFactionSchema, loreCharacterSchema, loreTimelineSchema } from "../schemas/phase6.js";
import { loreService } from "../services/lore.service.js";
import { auditService } from "../services/audit.service.js";
import { sendSuccess } from "../utils/response.js";

async function audit(req: FastifyRequest, action: string, resourceId?: string) {
  await auditService.log({
    adminUserId: req.adminAuth?.sub !== "api-key" ? req.adminAuth?.sub : undefined,
    action,
    resource: "Lore",
    resourceId,
    ipAddress: req.ip,
    userAgent: req.headers["user-agent"],
  });
}

export const loreAdminController = {
  listFactions: async (_req: FastifyRequest, reply: FastifyReply) =>
    sendSuccess(reply, 200, await loreService.adminListFactions()),

  saveFaction: async (req: FastifyRequest, reply: FastifyReply) => {
    const body = loreFactionSchema.parse(req.body);
    const row = await loreService.adminUpsertFaction(body);
    await loreService.invalidateCache(body.locale);
    await audit(req, "LORE_FACTION_SAVE", row.id);
    return sendSuccess(reply, 200, row);
  },

  listCharacters: async (_req: FastifyRequest, reply: FastifyReply) =>
    sendSuccess(reply, 200, await loreService.adminListCharacters()),

  saveCharacter: async (req: FastifyRequest, reply: FastifyReply) => {
    const body = loreCharacterSchema.parse(req.body);
    const row = await loreService.adminUpsertCharacter({
      ...body,
      factionId: body.factionId ?? undefined,
      regionId: body.regionId ?? undefined,
    });
    await loreService.invalidateCache(body.locale);
    await audit(req, "LORE_CHARACTER_SAVE", row.id);
    return sendSuccess(reply, 200, row);
  },

  listTimeline: async (_req: FastifyRequest, reply: FastifyReply) =>
    sendSuccess(reply, 200, await loreService.adminListTimeline()),

  saveTimeline: async (req: FastifyRequest, reply: FastifyReply) => {
    const body = loreTimelineSchema.parse(req.body);
    const row = await loreService.adminUpsertTimeline({
      ...body,
      factionId: body.factionId ?? undefined,
    });
    await loreService.invalidateCache(body.locale);
    await audit(req, "LORE_TIMELINE_SAVE", row.id);
    return sendSuccess(reply, 200, row);
  },

  delete: async (req: FastifyRequest, reply: FastifyReply) => {
    const { kind, id } = req.params as { kind: "faction" | "character" | "timeline"; id: string };
    await loreService.adminDelete(kind, id);
    await loreService.invalidateCache();
    await audit(req, "LORE_DELETE", id);
    return sendSuccess(reply, 200, { deleted: true });
  },
};
