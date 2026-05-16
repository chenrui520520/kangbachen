import { randomBytes } from "node:crypto";
import { prisma } from "./prisma.js";
import { pointsService } from "./points.service.js";
import { leaderboardService } from "./leaderboard.service.js";
import { badRequest, conflict, notFound } from "../errors/http-error.js";

const REFERRER_REWARD = 500;
const REFERRED_REWARD = 200;

function generateCode(): string {
  return randomBytes(4).toString("hex").toUpperCase();
}

async function ensureUniqueCode(): Promise<string> {
  for (let i = 0; i < 8; i++) {
    const code = generateCode();
    const exists = await prisma.referralCode.findUnique({ where: { code } });
    if (!exists) return code;
  }
  throw new Error("Failed to generate referral code");
}

export const referralService = {
  async ensureCode(userId: string) {
    const existing = await prisma.referralCode.findUnique({ where: { userId } });
    if (existing) return existing;

    const code = await ensureUniqueCode();
    return prisma.referralCode.create({
      data: { userId, code },
    });
  },

  async getMe(userId: string) {
    const codeRow = await this.ensureCode(userId);
    const relation = await prisma.referralRelation.findUnique({
      where: { referredId: userId },
      include: { referrer: { select: { id: true, username: true, email: true } } },
    });

    const stats = await this.getStats(userId);

    return {
      code: codeRow.code,
      inviteUrl: `/invite?ref=${codeRow.code}`,
      referredBy: relation
        ? {
            userId: relation.referrerId,
            displayName: relation.referrer.username ?? relation.referrer.email ?? relation.referrerId,
            boundAt: relation.createdAt.toISOString(),
          }
        : null,
      stats,
    };
  },

  async getStats(userId: string) {
    const [referralCount, rewardsEarned, rewardsSum] = await Promise.all([
      prisma.referralRelation.count({ where: { referrerId: userId } }),
      prisma.referralReward.count({ where: { userId } }),
      prisma.referralReward.aggregate({
        where: { userId },
        _sum: { rewardPoints: true },
      }),
    ]);

    const recent = await prisma.referralRelation.findMany({
      where: { referrerId: userId },
      orderBy: { createdAt: "desc" },
      take: 10,
      include: {
        referred: { select: { id: true, username: true, email: true, createdAt: true } },
      },
    });

    return {
      referralCount,
      rewardsEarned,
      totalRewardPoints: rewardsSum._sum.rewardPoints ?? 0,
      recentReferrals: recent.map((r) => ({
        userId: r.referredId,
        displayName: r.referred.username ?? r.referred.email ?? r.referredId,
        joinedAt: r.createdAt.toISOString(),
      })),
    };
  },

  async bind(userId: string, code: string) {
    const normalized = code.trim().toUpperCase();
    if (!normalized) throw badRequest("Referral code is required");

    const codeRow = await prisma.referralCode.findUnique({ where: { code: normalized } });
    if (!codeRow) throw notFound("Invalid referral code");
    if (codeRow.userId === userId) throw badRequest("You cannot use your own referral code");

    const existing = await prisma.referralRelation.findUnique({ where: { referredId: userId } });
    if (existing) throw conflict("You have already bound a referral code");

    const relation = await prisma.$transaction(async (tx) => {
      const rel = await tx.referralRelation.create({
        data: {
          referrerId: codeRow.userId,
          referredId: userId,
          code: normalized,
        },
      });

      await tx.referralReward.create({
        data: {
          userId: codeRow.userId,
          relationId: rel.id,
          rewardPoints: REFERRER_REWARD,
          type: "REFERRER",
        },
      });
      await tx.referralReward.create({
        data: {
          userId,
          relationId: rel.id,
          rewardPoints: REFERRED_REWARD,
          type: "REFERRED",
        },
      });

      await pointsService.earn(
        codeRow.userId,
        REFERRER_REWARD,
        "REFERRAL",
        { reference: rel.id, note: "Referral bonus" },
        tx,
      );
      await pointsService.earn(
        userId,
        REFERRED_REWARD,
        "REFERRAL",
        { reference: rel.id, note: "Welcome referral bonus" },
        tx,
      );

      return rel;
    });

    await leaderboardService.syncUserScores(codeRow.userId);
    await leaderboardService.syncUserScores(userId);
    await leaderboardService.upsertEntry(
      codeRow.userId,
      "referral",
      await prisma.referralRelation.count({ where: { referrerId: codeRow.userId } }),
    );

    const { analyticsService } = await import("./analytics.service.js");
    void analyticsService.track("REFERRAL_BIND", { userId, metadata: { referrerId: codeRow.userId } });

    return {
      bound: true,
      referrerId: relation.referrerId,
      rewardPoints: REFERRED_REWARD,
    };
  },
};
