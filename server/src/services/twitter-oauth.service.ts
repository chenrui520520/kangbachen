import { loadOAuthConfig } from "../config/oauth.js";
import { badRequest, unauthorized } from "../errors/http-error.js";
import { createPkcePair } from "../utils/pkce.js";
import {
  createOAuthState,
  saveOAuthPending,
  takeOAuthPending,
  type OAuthPending,
} from "./oauth-state.service.js";
import { sessionService } from "./session.service.js";
import { userService } from "./user.service.js";

type TwitterTokenResponse = {
  access_token: string;
  token_type: string;
  expires_in: number;
  scope: string;
};

type TwitterUserResponse = {
  data?: {
    id: string;
    name?: string;
    username?: string;
    profile_image_url?: string;
  };
};

function buildAuthorizeUrl(state: string, codeChallenge: string): string {
  const cfg = loadOAuthConfig().twitter;
  if (!cfg) throw badRequest("X (Twitter) OAuth is not configured");

  const params = new URLSearchParams({
    response_type: "code",
    client_id: cfg.clientId,
    redirect_uri: cfg.redirectUri,
    scope: "users.read tweet.read",
    state,
    code_challenge: codeChallenge,
    code_challenge_method: "S256",
  });

  return `https://twitter.com/i/oauth2/authorize?${params.toString()}`;
}

async function exchangeCode(code: string, codeVerifier: string): Promise<TwitterTokenResponse> {
  const cfg = loadOAuthConfig().twitter!;
  const body = new URLSearchParams({
    code,
    grant_type: "authorization_code",
    client_id: cfg.clientId,
    redirect_uri: cfg.redirectUri,
    code_verifier: codeVerifier,
  });

  const credentials = Buffer.from(`${cfg.clientId}:${cfg.clientSecret}`).toString("base64");
  const res = await fetch("https://api.twitter.com/2/oauth2/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${credentials}`,
    },
    body,
  });

  if (!res.ok) {
    const text = await res.text();
    throw unauthorized(`X token exchange failed: ${text.slice(0, 200)}`);
  }

  return (await res.json()) as TwitterTokenResponse;
}

async function fetchTwitterUser(accessToken: string) {
  const res = await fetch(
    "https://api.twitter.com/2/users/me?user.fields=profile_image_url",
    { headers: { Authorization: `Bearer ${accessToken}` } },
  );
  if (!res.ok) throw unauthorized("Failed to fetch X user profile");
  const json = (await res.json()) as TwitterUserResponse;
  if (!json.data?.id) throw unauthorized("Invalid X user profile");
  return json.data;
}

export const twitterOAuthService = {
  isConfigured(): boolean {
    return loadOAuthConfig().twitter !== null;
  },

  async start(returnTo: string): Promise<string> {
    const state = createOAuthState();
    const { codeVerifier, codeChallenge } = createPkcePair();
    const pending: OAuthPending = { provider: "twitter", returnTo, codeVerifier };
    await saveOAuthPending(state, pending);
    return buildAuthorizeUrl(state, codeChallenge);
  },

  async complete(
    code: string,
    state: string,
    meta?: { userAgent?: string; ipAddress?: string },
  ) {
    const pending = await takeOAuthPending(state);
    if (!pending || pending.provider !== "twitter" || !pending.codeVerifier) {
      throw badRequest("Invalid or expired OAuth state");
    }

    const tokens = await exchangeCode(code, pending.codeVerifier);
    const profile = await fetchTwitterUser(tokens.access_token);

    const user = await userService.findOrCreateByTwitter(profile.id, {
      username: profile.username ?? profile.name ?? null,
      avatarUrl: profile.profile_image_url ?? null,
    });

    const session = await sessionService.createSession(user.id, meta);
    return { session, returnTo: pending.returnTo };
  },
};
