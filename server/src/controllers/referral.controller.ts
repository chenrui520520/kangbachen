import type { FastifyReply, FastifyRequest } from "fastify";
import { referralBindBodySchema } from "../schemas/referral.js";
import { referralService } from "../services/referral.service.js";
import { sendSuccess } from "../utils/response.js";
import { HttpError } from "../errors/http-error.js";

function userId(req: FastifyRequest) {
  const id = req.authUser?.sub;
  if (!id) throw new HttpError(401, "Unauthorized");
  return id;
}

export const referralController = {
  me: async (req: FastifyRequest, reply: FastifyReply) => {
    return sendSuccess(reply, 200, await referralService.getMe(userId(req)));
  },

  bind: async (req: FastifyRequest, reply: FastifyReply) => {
    const body = referralBindBodySchema.parse(req.body);
    return sendSuccess(reply, 200, await referralService.bind(userId(req), body.code));
  },

  stats: async (req: FastifyRequest, reply: FastifyReply) => {
    return sendSuccess(reply, 200, await referralService.getStats(userId(req)));
  },
};
