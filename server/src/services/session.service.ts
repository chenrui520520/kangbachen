import { prisma } from "./prisma.js";
import {
  createRefreshTokenValue,
  refreshExpiresAt,
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from "./jwt.service.js";
import type { UserProfile } from "./user.service.js";
import { userService } from "./user.service.js";
import { badRequest, unauthorized } from "../errors/http-error.js";

export type AuthSessionResult = {
  user: UserProfile;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
};

export const sessionService = {
  async createSession(
    userId: string,
    meta?: { userAgent?: string; ipAddress?: string },
  ): Promise<AuthSessionResult> {
    const user = await userService.findById(userId);
    if (!user) throw unauthorized("User not found");

    const refreshValue = createRefreshTokenValue();
    const expiresAt = refreshExpiresAt();

    const session = await prisma.userSession.create({
      data: {
        userId,
        refreshToken: refreshValue,
        expiresAt,
        userAgent: meta?.userAgent,
        ipAddress: meta?.ipAddress,
      },
    });

    const { token: accessToken, expiresIn } = signAccessToken(userId);
    const refreshToken = signRefreshToken(userId, session.id);

    return { user, accessToken, refreshToken, expiresIn };
  },

  async refreshSession(
    refreshTokenJwt: string,
    meta?: { userAgent?: string; ipAddress?: string },
  ): Promise<AuthSessionResult> {
    let payload;
    try {
      payload = verifyRefreshToken(refreshTokenJwt);
    } catch {
      throw unauthorized("Invalid refresh token");
    }

    const session = await prisma.userSession.findFirst({
      where: {
        id: payload.sid,
        userId: payload.sub,
        revokedAt: null,
        expiresAt: { gt: new Date() },
      },
    });
    if (!session) throw unauthorized("Session expired or revoked");

    await prisma.userSession.update({
      where: { id: session.id },
      data: { revokedAt: new Date() },
    });

    return this.createSession(payload.sub, meta);
  },

  async revokeSession(refreshTokenJwt?: string, userId?: string) {
    if (refreshTokenJwt) {
      try {
        const payload = verifyRefreshToken(refreshTokenJwt);
        await prisma.userSession.updateMany({
          where: { id: payload.sid, revokedAt: null },
          data: { revokedAt: new Date() },
        });
        return;
      } catch {
        throw badRequest("Invalid refresh token");
      }
    }
    if (userId) {
      await prisma.userSession.updateMany({
        where: { userId, revokedAt: null },
        data: { revokedAt: new Date() },
      });
    }
  },
};
