import type { FastifyReply, FastifyRequest } from "fastify";
import { analyticsTrackSchema } from "../schemas/cms.js";
import { analyticsService } from "../services/analytics.service.js";
import { sendSuccess } from "../utils/response.js";
import { HttpError } from "../errors/http-error.js";

function userId(req: FastifyRequest) {
  return req.authUser?.sub;
}

export const analyticsController = {
  track: async (req: FastifyRequest, reply: FastifyReply) => {
    const body = analyticsTrackSchema.parse(req.body);
    await analyticsService.track(body.eventType, {
      userId: userId(req),
      sessionId: body.sessionId,
      path: body.path,
      metadata: body.metadata,
    });
    return reply.status(204).send();
  },

  dashboard: async (req: FastifyRequest, reply: FastifyReply) => {
    const days = Number((req.query as { days?: string }).days ?? 14);
    return sendSuccess(reply, 200, await analyticsService.getDashboard(Math.min(days, 90)));
  },
};

export function analyticsUserId(req: FastifyRequest) {
  const id = req.authUser?.sub;
  if (!id) throw new HttpError(401, "Unauthorized");
  return id;
}
