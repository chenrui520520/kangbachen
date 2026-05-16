import jwt, { type SignOptions } from "jsonwebtoken";
import { randomBytes } from "node:crypto";
import { loadEnv } from "../config/env.js";

export type JwtAccessPayload = {
  sub: string;
  type: "access";
};

export type JwtRefreshPayload = {
  sub: string;
  sid: string;
  type: "refresh";
};

function getSecret() {
  return loadEnv().JWT_SECRET;
}

function accessExpiresIn() {
  return loadEnv().JWT_ACCESS_EXPIRES_IN;
}

function refreshExpiresIn() {
  return loadEnv().JWT_REFRESH_EXPIRES_IN;
}

function signOptionsFromEnv(envValue: string): SignOptions {
  return { expiresIn: envValue as SignOptions["expiresIn"] };
}

export function signAccessToken(userId: string): { token: string; expiresIn: number } {
  const expiresInSec = parseExpirySeconds(accessExpiresIn());
  const token = jwt.sign(
    { sub: userId, type: "access" },
    getSecret(),
    signOptionsFromEnv(accessExpiresIn()),
  );
  return { token, expiresIn: expiresInSec };
}

export function signRefreshToken(userId: string, sessionId: string): string {
  return jwt.sign(
    { sub: userId, sid: sessionId, type: "refresh" },
    getSecret(),
    signOptionsFromEnv(refreshExpiresIn()),
  );
}

export function verifyAccessToken(token: string): JwtAccessPayload {
  const payload = jwt.verify(token, getSecret()) as JwtAccessPayload;
  if (payload.type !== "access" || !payload.sub) {
    throw new Error("Invalid access token");
  }
  return payload;
}

export function verifyRefreshToken(token: string): JwtRefreshPayload {
  const payload = jwt.verify(token, getSecret()) as JwtRefreshPayload;
  if (payload.type !== "refresh" || !payload.sub || !payload.sid) {
    throw new Error("Invalid refresh token");
  }
  return payload;
}

export function createRefreshTokenValue(): string {
  return randomBytes(48).toString("base64url");
}

function parseExpirySeconds(exp: string): number {
  const match = /^(\d+)([smhd])$/.exec(exp);
  if (!match) return 900;
  const n = Number(match[1]);
  const unit = match[2];
  const mult = unit === "s" ? 1 : unit === "m" ? 60 : unit === "h" ? 3600 : 86400;
  return n * mult;
}

export function refreshExpiresAt(): Date {
  const seconds = parseExpirySeconds(refreshExpiresIn());
  return new Date(Date.now() + seconds * 1000);
}
