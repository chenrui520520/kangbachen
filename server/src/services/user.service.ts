import type { User, WalletAccount } from "@prisma/client";
import { prisma } from "./prisma.js";
import { referralService } from "./referral.service.js";

export type UserProfile = {
  id: string;
  email: string | null;
  username: string | null;
  avatarUrl: string | null;
  language: string;
  points: number;
  walletAccounts: { address: string; chainId: number }[];
};

function toProfile(
  user: User & { walletAccounts: Pick<WalletAccount, "address" | "chainId">[] },
): UserProfile {
  return {
    id: user.id,
    email: user.email,
    username: user.username,
    avatarUrl: user.avatarUrl,
    language: user.language,
    points: user.points,
    walletAccounts: user.walletAccounts.map((w) => ({
      address: w.address,
      chainId: w.chainId,
    })),
  };
}

export const userService = {
  async findById(userId: string): Promise<UserProfile | null> {
    const user = await prisma.user.findFirst({
      where: { id: userId, deletedAt: null },
      include: { walletAccounts: { select: { address: true, chainId: true } } },
    });
    return user ? toProfile(user) : null;
  },

  async findOrCreateByEmail(email: string, language = "en"): Promise<UserProfile> {
    return userService.findOrCreateByOAuthEmail(email, { username: null, avatarUrl: null }, language);
  },

  async findOrCreateByOAuthEmail(
    email: string,
    profile: { username: string | null; avatarUrl: string | null },
    language = "en",
  ): Promise<UserProfile> {
    const normalized = email.toLowerCase().trim();
    let user = await prisma.user.findFirst({
      where: { email: normalized, deletedAt: null },
      include: { walletAccounts: { select: { address: true, chainId: true } } },
    });
    if (!user) {
      user = await prisma.user.create({
        data: {
          email: normalized,
          language,
          username: profile.username ?? undefined,
          avatarUrl: profile.avatarUrl ?? undefined,
        },
        include: { walletAccounts: { select: { address: true, chainId: true } } },
      });
      await referralService.ensureCode(user.id);
    } else if (profile.username || profile.avatarUrl) {
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          ...(profile.username ? { username: profile.username } : {}),
          ...(profile.avatarUrl ? { avatarUrl: profile.avatarUrl } : {}),
        },
        include: { walletAccounts: { select: { address: true, chainId: true } } },
      });
    }
    return toProfile(user);
  },

  async findOrCreateByTwitter(
    twitterId: string,
    profile: { username: string | null; avatarUrl: string | null },
    language = "en",
  ): Promise<UserProfile> {
    let user = await prisma.user.findFirst({
      where: { twitterId, deletedAt: null },
      include: { walletAccounts: { select: { address: true, chainId: true } } },
    });
    if (!user) {
      user = await prisma.user.create({
        data: {
          twitterId,
          language,
          username: profile.username ?? undefined,
          avatarUrl: profile.avatarUrl ?? undefined,
        },
        include: { walletAccounts: { select: { address: true, chainId: true } } },
      });
      await referralService.ensureCode(user.id);
    } else if (profile.username || profile.avatarUrl) {
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          ...(profile.username ? { username: profile.username } : {}),
          ...(profile.avatarUrl ? { avatarUrl: profile.avatarUrl } : {}),
        },
        include: { walletAccounts: { select: { address: true, chainId: true } } },
      });
    }
    return toProfile(user);
  },

  async findOrCreateByWallet(
    address: string,
    chainId: number,
    language = "en",
  ): Promise<UserProfile> {
    const existing = await prisma.walletAccount.findUnique({
      where: { address_chainId: { address, chainId } },
      include: {
        user: {
          include: { walletAccounts: { select: { address: true, chainId: true } } },
        },
      },
    });
    if (existing?.user && !existing.user.deletedAt) {
      return toProfile(existing.user);
    }

    const user = await prisma.user.create({
      data: {
        language,
        walletAccounts: {
          create: { address, chainId },
        },
      },
      include: { walletAccounts: { select: { address: true, chainId: true } } },
    });
    await referralService.ensureCode(user.id);
    return toProfile(user);
  },

  async linkWallet(userId: string, address: string, chainId: number): Promise<UserProfile> {
    const linked = await prisma.walletAccount.findUnique({
      where: { address_chainId: { address, chainId } },
    });
    if (linked && linked.userId !== userId) {
      throw new Error("Wallet already linked to another account");
    }
    if (!linked) {
      await prisma.walletAccount.create({
        data: { userId, address, chainId },
      });
    }
    const user = await prisma.user.findUniqueOrThrow({
      where: { id: userId },
      include: { walletAccounts: { select: { address: true, chainId: true } } },
    });
    return toProfile(user);
  },
};
