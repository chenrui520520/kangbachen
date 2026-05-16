import type { FastifyReply, FastifyRequest } from "fastify";
import { adminAuthService, type AdminRole } from "../services/admin-auth.service.js";
import { unauthorized, forbidden } from "../errors/http-error.js";
import { assertAdminKey } from "../services/admin.service.js";

export async function requireAdminJwt(request: FastifyRequest, _reply: FastifyReply) {
  const header = request.headers.authorization;
  const token = header?.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) throw unauthorized("Admin token required");
  request.adminAuth = adminAuthService.verifyToken(token);
}

export function requireAdminPermission(permission: string) {
  return async (request: FastifyRequest, _reply: FastifyReply) => {
    if (!request.adminAuth) throw unauthorized("Admin token required");
    if (!adminAuthService.hasPermission(request.adminAuth.role, permission)) {
      throw forbidden("Insufficient admin permissions");
    }
  };
}

/** API key OR JWT — for backward-compatible export routes */
export async function requireAdminAccess(request: FastifyRequest, reply: FastifyReply) {
  const apiKey = request.headers["x-admin-key"] as string | undefined;
  if (process.env.ADMIN_API_KEY && apiKey === process.env.ADMIN_API_KEY) {
    request.adminAuth = {
      sub: "api-key",
      email: "api-key@system",
      role: "SUPERADMIN" as AdminRole,
      type: "admin",
    };
    return;
  }
  await requireAdminJwt(request, reply);
}
