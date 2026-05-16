import { verifyMessage } from "viem";
import { prisma } from "./prisma.js";
import { nonceService } from "./nonce.service.js";
import { userService } from "./user.service.js";
import { sessionService, type AuthSessionResult } from "./session.service.js";
import { badRequest } from "../errors/http-error.js";

export const walletAuthService = {
  async requestNonce(address: string, chainId: number) {
    return nonceService.createWalletNonce(address, chainId);
  },

  async loginWithSignature(
    address: string,
    chainId: number,
    signature: `0x${string}`,
    meta?: { userAgent?: string; ipAddress?: string },
  ): Promise<AuthSessionResult> {
    const record = await prisma.authNonce.findFirst({
      where: {
        address,
        chainId,
        usedAt: null,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: "desc" },
    });
    if (!record) {
      throw badRequest("No pending sign-in request. Request a nonce first.");
    }

    const valid = await verifyMessage({
      address: address as `0x${string}`,
      message: record.message,
      signature,
    });
    if (!valid) {
      throw badRequest("Signature verification failed");
    }

    await nonceService.consumeWalletNonce(address, chainId, record.message);
    const user = await userService.findOrCreateByWallet(address, chainId);
    return sessionService.createSession(user.id, meta);
  },
};
