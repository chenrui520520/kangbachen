import { badRequest } from "../errors/http-error.js";
import { sessionService } from "./session.service.js";
import { userService } from "./user.service.js";

export function isOAuthDevMockEnabled(): boolean {
  return (
    process.env.NODE_ENV !== "production" &&
    process.env.OAUTH_DEV_MOCK === "true"
  );
}

export const oauthDevMockService = {
  async complete(
    provider: "google" | "twitter",
    returnTo: string,
    meta?: { userAgent?: string; ipAddress?: string },
  ) {
    if (!isOAuthDevMockEnabled()) {
      throw badRequest("OAuth dev mock is disabled");
    }

    const user =
      provider === "google"
        ? await userService.findOrCreateByOAuthEmail("dev-oauth@kenba.local", {
            username: "Dev Google User",
            avatarUrl: null,
          })
        : await userService.findOrCreateByTwitter("dev-twitter-KENBA", {
            username: "DevXUser",
            avatarUrl: null,
          });

    const session = await sessionService.createSession(user.id, meta);
    return { session, returnTo };
  },
};
