import { randomInt } from "node:crypto";
import nodemailer from "nodemailer";
import { prisma } from "./prisma.js";
import { loadEnv } from "../config/env.js";
import { userService } from "./user.service.js";
import { sessionService, type AuthSessionResult } from "./session.service.js";
import { badRequest } from "../errors/http-error.js";
import { logger } from "../utils/logger.js";

function generateCode() {
  return String(randomInt(100000, 999999));
}

async function sendMockEmail(email: string, code: string) {
  const env = loadEnv();
  if (env.MOCK_SMTP) {
    logger.info({ email, code }, "[Mock SMTP] Email verification code");
    return;
  }
  const transport = nodemailer.createTransport({
    host: process.env.SMTP_HOST ?? "127.0.0.1",
    port: Number(process.env.SMTP_PORT ?? 1025),
    secure: false,
  });
  await transport.sendMail({
    from: process.env.SMTP_FROM ?? "noreply@kenba.local",
    to: email,
    subject: "KENBA verification code",
    text: `Your KENBA verification code is: ${code}`,
  });
}

export const emailAuthService = {
  async requestCode(email: string) {
    const env = loadEnv();
    if (env.NODE_ENV === "production" && env.MOCK_SMTP) {
      throw badRequest("Email login is not available; configure SMTP for production");
    }
    const ttlMinutes = env.EMAIL_CODE_TTL_MINUTES;
    const code = generateCode();
    const expiresAt = new Date(Date.now() + ttlMinutes * 60 * 1000);

    await prisma.emailVerificationCode.create({
      data: { email, code, expiresAt },
    });

    await sendMockEmail(email, code);

    return {
      email,
      expiresAt: expiresAt.toISOString(),
      message: env.MOCK_SMTP
        ? "Verification code sent (check server logs in development)"
        : "Verification code sent",
    };
  },

  async verifyCode(
    email: string,
    code: string,
    meta?: { userAgent?: string; ipAddress?: string },
  ): Promise<AuthSessionResult> {
    const record = await prisma.emailVerificationCode.findFirst({
      where: {
        email,
        code,
        usedAt: null,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: "desc" },
    });
    if (!record) {
      throw badRequest("Invalid or expired verification code");
    }

    await prisma.emailVerificationCode.update({
      where: { id: record.id },
      data: { usedAt: new Date() },
    });

    const user = await userService.findOrCreateByEmail(email);
    return sessionService.createSession(user.id, meta);
  },
};
