import { randomBytes } from "node:crypto";
import { prisma } from "./prisma.js";
import { loadEnv } from "../config/env.js";
import { badRequest } from "../errors/http-error.js";

function buildSignMessage(address: string, nonce: string, chainId: number) {
  const issuedAt = new Date().toISOString();
  return [
    "KENBA wants you to sign in with your Ethereum account:",
    address,
    "",
    `Chain ID: ${chainId}`,
    `Nonce: ${nonce}`,
    `Issued at: ${issuedAt}`,
  ].join("\n");
}

export const nonceService = {
  async createWalletNonce(address: string, chainId: number) {
    const ttlMinutes = loadEnv().AUTH_NONCE_TTL_MINUTES;
    const nonce = randomBytes(16).toString("hex");
    const expiresAt = new Date(Date.now() + ttlMinutes * 60 * 1000);
    const message = buildSignMessage(address, nonce, chainId);

    await prisma.authNonce.create({
      data: { address, chainId, nonce, message, expiresAt },
    });

    return { nonce, message, expiresAt: expiresAt.toISOString() };
  },

  async consumeWalletNonce(address: string, chainId: number, message: string) {
    const record = await prisma.authNonce.findFirst({
      where: {
        address,
        chainId,
        message,
        usedAt: null,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: "desc" },
    });
    if (!record) {
      throw badRequest("Invalid or expired nonce. Request a new sign-in message.");
    }
    await prisma.authNonce.update({
      where: { id: record.id },
      data: { usedAt: new Date() },
    });
    return record;
  },
};
