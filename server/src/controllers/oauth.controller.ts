import type { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { loadOAuthConfig } from "../config/oauth.js";
import { HttpError } from "../errors/http-error.js";
import { googleOAuthService } from "../services/google-oauth.service.js";
import { isOAuthDevMockEnabled, oauthDevMockService } from "../services/oauth-dev-mock.service.js";
import { twitterOAuthService } from "../services/twitter-oauth.service.js";
import { issueOAuthTicket, takeOAuthTicket } from "../services/oauth-state.service.js";
import type { AuthSessionResult } from "../services/session.service.js";
import { sendSuccess } from "../utils/response.js";

const returnToQuery = z.object({
  returnTo: z.string().max(500).optional().default("/"),
});

const callbackQuery = z.object({
  code: z.string().min(1),
  state: z.string().min(1),
});

const completeBody = z.object({
  ticket: z.string().min(1),
});

function requestMeta(req: FastifyRequest) {
  return {
    userAgent: req.headers["user-agent"],
    ipAddress: req.ip,
  };
}

function parseLocale(returnTo: string): string {
  const m = returnTo.match(/^\/(en|zh|ja|ko|ar)(\/|$)/);
  return m?.[1] ?? "en";
}

function callbackUrl(path: string, params: Record<string, string>) {
  const { webPublicUrl } = loadOAuthConfig();
  const q = new URLSearchParams(params).toString();
  return `${webPublicUrl}${path}?${q}`;
}

async function finishOAuth(
  reply: FastifyReply,
  handler: () => Promise<{ session: AuthSessionResult; returnTo: string }>,
  provider: string,
) {
  try {
    const { session, returnTo } = await handler();
    const ticket = await issueOAuthTicket(session);
    const locale = parseLocale(returnTo);
    return reply.redirect(
      callbackUrl(`/${locale}/auth/callback`, { ticket, provider }),
    );
  } catch (err) {
    const message = err instanceof HttpError ? err.message : "OAuth sign-in failed";
    const returnTo =
      (err instanceof HttpError && typeof err.details === "object" && err.details && "returnTo" in err.details
        ? String((err.details as { returnTo: string }).returnTo)
        : "/") || "/";
    const locale = parseLocale(returnTo);
    return reply.redirect(
      callbackUrl(`/${locale}/auth/callback`, { error: message, provider }),
    );
  }
}

export const oauthController = {
  providers: async (_req: FastifyRequest, reply: FastifyReply) => {
    const mock = isOAuthDevMockEnabled();
    return sendSuccess(reply, 200, {
      google: googleOAuthService.isConfigured() || mock,
      twitter: twitterOAuthService.isConfigured() || mock,
      devMock: mock,
    });
  },

  googleStart: async (req: FastifyRequest, reply: FastifyReply) => {
    const { returnTo } = returnToQuery.parse(req.query);
    if (!googleOAuthService.isConfigured()) {
      if (isOAuthDevMockEnabled()) {
        return finishOAuth(
          reply,
          () => oauthDevMockService.complete("google", returnTo, requestMeta(req)),
          "google",
        );
      }
      return reply.status(503).send({
        success: false,
        code: 503,
        message: "Google OAuth is not configured (set GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET)",
      });
    }
    const url = await googleOAuthService.start(returnTo);
    return reply.redirect(url);
  },

  googleCallback: (req: FastifyRequest, reply: FastifyReply) => {
    const query = req.query as Record<string, string | undefined>;
    if (query.error) {
      const locale = parseLocale(query.state ? `/${query.state}` : "/");
      return reply.redirect(
        callbackUrl(`/${locale}/auth/callback`, {
          error: query.error_description ?? query.error,
          provider: "google",
        }),
      );
    }
    const q = callbackQuery.parse(req.query);
    return finishOAuth(
      reply,
      () => googleOAuthService.complete(q.code, q.state, requestMeta(req)),
      "google",
    );
  },

  twitterStart: async (req: FastifyRequest, reply: FastifyReply) => {
    const { returnTo } = returnToQuery.parse(req.query);
    if (!twitterOAuthService.isConfigured()) {
      if (isOAuthDevMockEnabled()) {
        return finishOAuth(
          reply,
          () => oauthDevMockService.complete("twitter", returnTo, requestMeta(req)),
          "twitter",
        );
      }
      return reply.status(503).send({
        success: false,
        code: 503,
        message: "X OAuth is not configured (set TWITTER_CLIENT_ID / TWITTER_CLIENT_SECRET)",
      });
    }
    const url = await twitterOAuthService.start(returnTo);
    return reply.redirect(url);
  },

  twitterCallback: (req: FastifyRequest, reply: FastifyReply) => {
    const query = req.query as Record<string, string | undefined>;
    if (query.error) {
      const locale = parseLocale(query.state ? `/${query.state}` : "/");
      return reply.redirect(
        callbackUrl(`/${locale}/auth/callback`, {
          error: query.error_description ?? query.error,
          provider: "twitter",
        }),
      );
    }
    const q = callbackQuery.parse(req.query);
    return finishOAuth(
      reply,
      () => twitterOAuthService.complete(q.code, q.state, requestMeta(req)),
      "twitter",
    );
  },

  complete: async (req: FastifyRequest, reply: FastifyReply) => {
    const body = completeBody.parse(req.body);
    const session = await takeOAuthTicket<AuthSessionResult>(body.ticket);
    if (!session) {
      return reply.status(400).send({
        success: false,
        code: 400,
        message: "Invalid or expired login ticket",
      });
    }
    return sendSuccess(reply, 200, session);
  },
};
