import { loadOAuthConfig } from "../config/oauth.js";
import { badRequest, unauthorized } from "../errors/http-error.js";
import {
  createOAuthState,
  saveOAuthPending,
  takeOAuthPending,
  type OAuthPending,
} from "./oauth-state.service.js";
import { sessionService } from "./session.service.js";
import { userService } from "./user.service.js";

type GoogleTokenResponse = {
  access_token: string;
  expires_in: number;
  token_type: string;
  scope: string;
  id_token?: string;
};

type GoogleUserInfo = {
  sub: string;
  email?: string;
  email_verified?: boolean;
  name?: string;
  picture?: string;
};

function buildAuthorizeUrl(state: string): string {
  const cfg = loadOAuthConfig().google;
  if (!cfg) throw badRequest("Google OAuth is not configured");

  const params = new URLSearchParams({
    client_id: cfg.clientId,
    redirect_uri: cfg.redirectUri,
    response_type: "code",
    scope: "openid email profile",
    state,
    access_type: "online",
    prompt: "select_account",
  });

  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

async function exchangeCode(code: string): Promise<GoogleTokenResponse> {
  const cfg = loadOAuthConfig().google!;
  const body = new URLSearchParams({
    code,
    client_id: cfg.clientId,
    client_secret: cfg.clientSecret,
    redirect_uri: cfg.redirectUri,
    grant_type: "authorization_code",
  });

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });

  if (!res.ok) {
    const text = await res.text();
    throw unauthorized(`Google token exchange failed: ${text.slice(0, 200)}`);
  }

  return (await res.json()) as GoogleTokenResponse;
}

async function fetchUserInfo(accessToken: string): Promise<GoogleUserInfo> {
  const res = await fetch("https://openidconnect.googleapis.com/v1/userinfo", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) throw unauthorized("Failed to fetch Google user profile");
  return (await res.json()) as GoogleUserInfo;
}

export const googleOAuthService = {
  isConfigured(): boolean {
    return loadOAuthConfig().google !== null;
  },

  async start(returnTo: string): Promise<string> {
    const state = createOAuthState();
    const pending: OAuthPending = { provider: "google", returnTo };
    await saveOAuthPending(state, pending);
    return buildAuthorizeUrl(state);
  },

  async complete(
    code: string,
    state: string,
    meta?: { userAgent?: string; ipAddress?: string },
  ) {
    const pending = await takeOAuthPending(state);
    if (!pending || pending.provider !== "google") {
      throw badRequest("Invalid or expired OAuth state");
    }

    const tokens = await exchangeCode(code);
    const profile = await fetchUserInfo(tokens.access_token);
    if (!profile.email || profile.email_verified === false) {
      throw badRequest("Google account must have a verified email");
    }

    const user = await userService.findOrCreateByOAuthEmail(profile.email, {
      username: profile.name ?? null,
      avatarUrl: profile.picture ?? null,
    });

    const session = await sessionService.createSession(user.id, meta);
    return { session, returnTo: pending.returnTo };
  },
};
