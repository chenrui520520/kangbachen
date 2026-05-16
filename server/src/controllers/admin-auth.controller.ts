import type { FastifyReply, FastifyRequest } from "fastify";
import { adminLoginSchema } from "../schemas/cms.js";
import { adminAuthService } from "../services/admin-auth.service.js";
import { sendSuccess } from "../utils/response.js";

export const adminAuthController = {
  login: async (req: FastifyRequest, reply: FastifyReply) => {
    const body = adminLoginSchema.parse(req.body);
    const session = await adminAuthService.login(body.email, body.password, {
      ip: req.ip,
      userAgent: req.headers["user-agent"],
    });
    return sendSuccess(reply, 200, session);
  },

  me: async (req: FastifyRequest, reply: FastifyReply) => {
    return sendSuccess(reply, 200, {
      id: req.adminAuth!.sub,
      email: req.adminAuth!.email,
      role: req.adminAuth!.role,
    });
  },
};
