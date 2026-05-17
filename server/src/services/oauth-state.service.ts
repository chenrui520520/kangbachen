import { randomBytes } from "node:crypto";
import { getRedis } from "./redis.js";

const STATE_TTL_SEC = 600;
const TICKET_TTL_SEC = 120;

export type OAuthProvider = "google" | "twitter";

export type OAuthPending = {
  provider: OAuthProvider;
  returnTo: string;
  codeVerifier?: string;
};

export function createOAuthState(): string {
  return randomBytes(24).toString("base64url");
}

export async function saveOAuthPending(state: string, data: OAuthPending): Promise<void> {
  await getRedis().setex(`oauth:state:${state}`, STATE_TTL_SEC, JSON.stringify(data));
}

export async function takeOAuthPending(state: string): Promise<OAuthPending | null> {
  const key = `oauth:state:${state}`;
  const raw = await getRedis().get(key);
  if (!raw) return null;
  await getRedis().del(key);
  return JSON.parse(raw) as OAuthPending;
}

export async function issueOAuthTicket(payload: unknown): Promise<string> {
  const ticket = randomBytes(24).toString("base64url");
  await getRedis().setex(`oauth:ticket:${ticket}`, TICKET_TTL_SEC, JSON.stringify(payload));
  return ticket;
}

export async function takeOAuthTicket<T>(ticket: string): Promise<T | null> {
  const key = `oauth:ticket:${ticket}`;
  const raw = await getRedis().get(key);
  if (!raw) return null;
  await getRedis().del(key);
  return JSON.parse(raw) as T;
}
