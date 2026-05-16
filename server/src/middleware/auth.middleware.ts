import type { FastifyReply, FastifyRequest } from "fastify";
import { verifyAccessToken } from "../services/jwt.service.js";
import { unauthorized } from "../errors/http-error.js";
import { HttpError } from "../errors/http-error.js";

export async function requireAuth(request: FastifyRequest, _reply: FastifyReply) {
  const header = request.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    throw unauthorized("Missing or invalid Authorization header");
  }
  const token = header.slice(7);
  try {
    request.authUser = verifyAccessToken(token);
  } catch {
    throw unauthorized("Invalid or expired access token");
  }
}

export function handleControllerError(error: unknown): never {
  if (error instanceof HttpError) throw error;
  throw error;
}
