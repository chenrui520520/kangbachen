import type { FastifyReply, FastifyRequest } from "fastify";
import { verifyAccessToken } from "../services/jwt.service.js";

/** Attaches authUser when a valid Bearer token is present; does not reject anonymous requests. */
export async function optionalAuth(request: FastifyRequest, _reply: FastifyReply) {
  const header = request.headers.authorization;
  if (!header?.startsWith("Bearer ")) return;
  try {
    request.authUser = verifyAccessToken(header.slice(7));
  } catch {
    // ignore invalid tokens for public routes
  }
}
