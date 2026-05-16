import type { JwtAccessPayload } from "../services/jwt.service.js";
import type { AdminTokenPayload } from "../services/admin-auth.service.js";

declare module "fastify" {
  interface FastifyRequest {
    authUser?: JwtAccessPayload;
    adminAuth?: AdminTokenPayload;
  }
}
