import type { FastifyReply, FastifyRequest } from "fastify";
import {
  emailRequestBodySchema,
  emailVerifyBodySchema,
  logoutBodySchema,
  refreshBodySchema,
  walletLoginBodySchema,
  walletNonceBodySchema,
} from "../schemas/auth.js";
import { sendSuccess } from "../utils/response.js";
import { walletAuthService } from "../services/wallet-auth.service.js";
import { emailAuthService } from "../services/email-auth.service.js";
import { sessionService } from "../services/session.service.js";
import { userService } from "../services/user.service.js";
import { verifyAccessToken } from "../services/jwt.service.js";
import { HttpError } from "../errors/http-error.js";

function requestMeta(req: FastifyRequest) {
  return {
    userAgent: req.headers["user-agent"],
    ipAddress: req.ip,
  };
}

async function run<T>(handler: () => Promise<T>, reply: FastifyReply, status = 200) {
  try {
    const data = await handler();
    return sendSuccess(reply, status, data);
  } catch (err) {
    if (err instanceof HttpError) {
      return reply.status(err.statusCode).send({
        success: false,
        code: err.statusCode,
        message: err.message,
        details: err.details,
      });
    }
    throw err;
  }
}

export const authController = {
  walletNonce: (req: FastifyRequest, reply: FastifyReply) =>
    run(async () => {
      const body = walletNonceBodySchema.parse(req.body);
      return walletAuthService.requestNonce(body.address, body.chainId);
    }, reply),

  loginWallet: (req: FastifyRequest, reply: FastifyReply) =>
    run(async () => {
      const body = walletLoginBodySchema.parse(req.body);
      return walletAuthService.loginWithSignature(
        body.address,
        body.chainId,
        body.signature as `0x${string}`,
        requestMeta(req),
      );
    }, reply),

  emailRequest: (req: FastifyRequest, reply: FastifyReply) =>
    run(async () => {
      const body = emailRequestBodySchema.parse(req.body);
      return emailAuthService.requestCode(body.email);
    }, reply),

  emailVerify: (req: FastifyRequest, reply: FastifyReply) =>
    run(async () => {
      const body = emailVerifyBodySchema.parse(req.body);
      return emailAuthService.verifyCode(body.email, body.code, requestMeta(req));
    }, reply),

  loginTwitter: async (req: FastifyRequest, reply: FastifyReply) => {
    const returnTo =
      typeof (req.body as { returnTo?: string })?.returnTo === "string"
        ? (req.body as { returnTo: string }).returnTo
        : "/";
    return reply.redirect(`/api/login/twitter?returnTo=${encodeURIComponent(returnTo)}`);
  },

  refresh: (req: FastifyRequest, reply: FastifyReply) =>
    run(async () => {
      const body = refreshBodySchema.parse(req.body);
      return sessionService.refreshSession(body.refreshToken, requestMeta(req));
    }, reply),

  logout: (req: FastifyRequest, reply: FastifyReply) =>
    run(async () => {
      const body = logoutBodySchema.parse(req.body ?? {});
      let userId: string | undefined;
      const authHeader = req.headers.authorization;
      if (authHeader?.startsWith("Bearer ")) {
        try {
          userId = verifyAccessToken(authHeader.slice(7)).sub;
        } catch {
          /* optional bearer */
        }
      }
      await sessionService.revokeSession(body.refreshToken, userId);
      return { ok: true };
    }, reply),

  me: (req: FastifyRequest, reply: FastifyReply) =>
    run(async () => {
      const userId = req.authUser?.sub;
      if (!userId) throw new HttpError(401, "Unauthorized");
      const user = await userService.findById(userId);
      if (!user) throw new HttpError(404, "User not found");
      return { user };
    }, reply),
};
