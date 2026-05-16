import { prisma } from "./prisma.js";
import { pointsService, PointsTransactionType } from "./points.service.js";
import { nftService } from "./nft.service.js";
import { badRequest } from "../errors/http-error.js";
import { daysBetweenUtc, utcToday } from "../utils/date.js";

const CYCLE_LENGTH = 30;

function computeNextCycleDay(lastCycleDay: number, continued: boolean): number {
  if (!continued) return 1;
  if (lastCycleDay >= CYCLE_LENGTH) return 1;
  return lastCycleDay + 1;
}

export const signinService = {
  async getStatus(userId: string) {
    const today = utcToday();
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        signInStreak: true,
        signInCycleDay: true,
        lastSignInDate: true,
        points: true,
      },
    });
    if (!user) throw badRequest("User not found");

    const claimedToday = await prisma.userDailyClaim.findUnique({
      where: { userId_claimDate: { userId, claimDate: today } },
    });

    const configs = await prisma.signInRewardConfig.findMany({
      orderBy: { day: "asc" },
      include: { nftReward: true },
    });

    let nextCycleDay = 1;
    if (user.lastSignInDate && !claimedToday) {
      const gap = daysBetweenUtc(user.lastSignInDate, today);
      const continued = gap === 1;
      nextCycleDay = computeNextCycleDay(user.signInCycleDay, continued);
    } else if (claimedToday) {
      nextCycleDay = user.signInCycleDay;
    } else if (user.signInCycleDay > 0) {
      nextCycleDay = computeNextCycleDay(user.signInCycleDay, false);
    }

    const preview = configs.find((c) => c.day === nextCycleDay) ?? configs[0];

    return {
      today: today.toISOString().slice(0, 10),
      claimedToday: Boolean(claimedToday),
      streak: user.signInStreak,
      cycleDay: user.signInCycleDay,
      nextCycleDay,
      pointsBalance: user.points,
      preview: preview
        ? {
            day: preview.day,
            rewardPoints: preview.rewardPoints,
            nft: preview.nftReward
              ? {
                  id: preview.nftReward.id,
                  name: preview.nftReward.name,
                  rarity: preview.nftReward.rarity,
                  imageUrl: preview.nftReward.imageUrl,
                }
              : null,
          }
        : null,
      cycle: configs.map((c) => ({
        day: c.day,
        rewardPoints: c.rewardPoints,
        nft: c.nftReward
          ? { id: c.nftReward.id, name: c.nftReward.name, rarity: c.nftReward.rarity }
          : null,
      })),
    };
  },

  async claim(userId: string) {
    const today = utcToday();

    const existing = await prisma.userDailyClaim.findUnique({
      where: { userId_claimDate: { userId, claimDate: today } },
    });
    if (existing) throw badRequest("Already claimed today");

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { signInStreak: true, signInCycleDay: true, lastSignInDate: true },
    });
    if (!user) throw badRequest("User not found");

    let streak = 1;
    let cycleDay = 1;

    if (user.lastSignInDate) {
      const gap = daysBetweenUtc(user.lastSignInDate, today);
      if (gap === 0) throw badRequest("Already claimed today");
      if (gap === 1) {
        streak = user.signInStreak + 1;
        cycleDay = computeNextCycleDay(user.signInCycleDay, true);
      } else {
        streak = 1;
        cycleDay = 1;
      }
    }

    const config = await prisma.signInRewardConfig.findUnique({
      where: { day: cycleDay },
      include: { nftReward: true },
    });
    if (!config) throw badRequest("Reward config missing for cycle day");

    const result = await prisma.$transaction(async (tx) => {
      await tx.userDailyClaim.create({
        data: {
          userId,
          claimDate: today,
          cycleDay,
          rewardPoints: config.rewardPoints,
          nftRewardId: config.nftRewardId,
        },
      });

      await tx.userSignInHistory.create({
        data: {
          userId,
          signInDate: today,
          rewardDay: cycleDay,
          rewardPoints: config.rewardPoints,
          rewardNftId: config.nftRewardId,
        },
      });

      await tx.user.update({
        where: { id: userId },
        data: {
          signInStreak: streak,
          signInCycleDay: cycleDay,
          lastSignInDate: today,
        },
      });

      await pointsService.earn(
        userId,
        config.rewardPoints,
        PointsTransactionType.SIGNIN,
        { reference: `signin-${formatDate(today)}`, note: `Day ${cycleDay} sign-in` },
        tx,
      );

      return {
        cycleDay,
        streak,
        rewardPoints: config.rewardPoints,
        nft: config.nftReward
          ? {
              id: config.nftReward.id,
              name: config.nftReward.name,
              rarity: config.nftReward.rarity,
              imageUrl: config.nftReward.imageUrl,
            }
          : null,
      };
    });

    let nftGranted = null;
    if (config.nftRewardId) {
      nftGranted = await nftService.grantToUser(userId, config.nftRewardId, "SIGNIN");
    }

    const { leaderboardService } = await import("./leaderboard.service.js");
    await leaderboardService.syncUserScores(userId);

    const balance = await pointsService.getBalance(userId);
    const { analyticsService } = await import("./analytics.service.js");
    void analyticsService.track("SIGNIN", { userId });

    return {
      ...result,
      pointsBalance: balance,
      claimDate: today.toISOString().slice(0, 10),
      nftGranted: nftGranted
        ? { id: nftGranted.id, nftRewardId: nftGranted.nftRewardId }
        : null,
    };
  },

  async history(userId: string, limit = 30) {
    const claims = await prisma.userDailyClaim.findMany({
      where: { userId },
      orderBy: { claimDate: "desc" },
      take: limit,
      include: { nftReward: true },
    });
    return claims.map((c) => ({
      id: c.id,
      claimDate: c.claimDate.toISOString().slice(0, 10),
      cycleDay: c.cycleDay,
      rewardPoints: c.rewardPoints,
      nft: c.nftReward
        ? {
            id: c.nftReward.id,
            name: c.nftReward.name,
            rarity: c.nftReward.rarity,
            imageUrl: c.nftReward.imageUrl,
          }
        : null,
    }));
  },
};

function formatDate(d: Date) {
  return d.toISOString().slice(0, 10);
}
