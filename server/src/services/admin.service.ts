import { prisma } from "./prisma.js";
import { loadEnv } from "../config/env.js";
import { unauthorized } from "../errors/http-error.js";
import { leaderboardService, type LeaderboardType } from "./leaderboard.service.js";
import { exportFileService, type ExportFormat } from "./export-file.service.js";

export function assertAdminKey(header?: string) {
  const key = process.env.ADMIN_API_KEY;
  if (!key) return;
  if (header !== key) throw unauthorized("Invalid admin API key");
}

export const adminService = {
  async exportRewards() {
    const [claims, transactions, nfts] = await Promise.all([
      prisma.userDailyClaim.findMany({
        include: {
          user: { select: { id: true, email: true, username: true } },
          nftReward: true,
        },
        orderBy: { claimDate: "desc" },
      }),
      prisma.pointsTransaction.findMany({
        include: { user: { select: { id: true, email: true, username: true } } },
        orderBy: { createdAt: "desc" },
        take: 5000,
      }),
      prisma.userNFT.findMany({
        include: {
          user: { select: { id: true, email: true, username: true } },
          nftReward: true,
        },
        orderBy: { acquiredAt: "desc" },
      }),
    ]);

    return {
      exportedAt: new Date().toISOString(),
      signInClaims: claims.map((c) => ({
        userId: c.userId,
        email: c.user.email,
        claimDate: c.claimDate.toISOString().slice(0, 10),
        cycleDay: c.cycleDay,
        rewardPoints: c.rewardPoints,
        nftId: c.nftRewardId,
        nftName: c.nftReward?.name,
      })),
      pointsTransactions: transactions.map((t) => ({
        userId: t.userId,
        email: t.user.email,
        amount: t.amount,
        type: t.type,
        reference: t.reference,
        createdAt: t.createdAt.toISOString(),
      })),
      userNfts: nfts.map((n) => ({
        userId: n.userId,
        email: n.user.email,
        nftId: n.nftRewardId,
        nftName: n.nftReward.name,
        rarity: n.nftReward.rarity,
        source: n.source,
        acquiredAt: n.acquiredAt.toISOString(),
      })),
    };
  },

  async exportLeaderboard(type: LeaderboardType = "points") {
    const board = await leaderboardService.buildLeaderboard(type);
    return {
      exportedAt: new Date().toISOString(),
      type,
      rows: board.rows,
    };
  },

  async userActivityStats() {
    const [users, claimsToday, tasksCompleted, orders] = await Promise.all([
      prisma.user.count({ where: { deletedAt: null } }),
      prisma.userDailyClaim.count({
        where: { claimDate: new Date(new Date().toISOString().slice(0, 10)) },
      }),
      prisma.userTask.count({ where: { completed: true } }),
      prisma.shopOrder.count(),
    ]);

    const totalPoints = await prisma.user.aggregate({
      _sum: { points: true },
      where: { deletedAt: null },
    });

    const [referralRelations, referralRewards] = await Promise.all([
      prisma.referralRelation.count(),
      prisma.referralReward.aggregate({ _sum: { rewardPoints: true } }),
    ]);

    return {
      generatedAt: new Date().toISOString(),
      totalUsers: users,
      claimsToday,
      tasksCompleted,
      shopOrders: orders,
      totalPointsOutstanding: totalPoints._sum.points ?? 0,
      referralRelations,
      referralRewardsTotal: referralRewards._sum.rewardPoints ?? 0,
      mockSmtp: loadEnv().MOCK_SMTP,
    };
  },

  async listUsers(page: number, limit: number, search?: string) {
    const where = {
      deletedAt: null,
      ...(search
        ? {
            OR: [
              { email: { contains: search, mode: "insensitive" as const } },
              { username: { contains: search, mode: "insensitive" as const } },
            ],
          }
        : {}),
    };
    const [total, users] = await Promise.all([
      prisma.user.count({ where }),
      prisma.user.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
        select: {
          id: true,
          email: true,
          username: true,
          points: true,
          signInStreak: true,
          createdAt: true,
          walletAccounts: { select: { address: true, chainId: true } },
          referralCode: { select: { code: true } },
        },
      }),
    ]);
    return { total, page, limit, users };
  },

  async listReferrals(page: number, limit: number) {
    const [total, rows] = await Promise.all([
      prisma.referralRelation.count(),
      prisma.referralRelation.findMany({
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          referrer: { select: { id: true, email: true, username: true } },
          referred: { select: { id: true, email: true, username: true } },
        },
      }),
    ]);
    return { total, page, limit, rows };
  },

  async listEvents() {
    return prisma.event.findMany({
      orderBy: { startsAt: "desc" },
      include: { rewards: true },
    });
  },

  async listShopItems() {
    return prisma.shopItem.findMany({
      orderBy: { createdAt: "desc" },
      include: { rewardNft: true },
    });
  },

  async exportPoints(format: ExportFormat, persist: boolean) {
    const rows = await prisma.pointsTransaction.findMany({
      include: { user: { select: { id: true, email: true, username: true } } },
      orderBy: { createdAt: "desc" },
      take: 10000,
    });
    const data = rows.map((t) => ({
      userId: t.userId,
      email: t.user.email,
      amount: t.amount,
      type: t.type,
      reference: t.reference,
      createdAt: t.createdAt.toISOString(),
    }));
    if (persist) {
      const file = await exportFileService.writeExport("points", data, format);
      return { data, file };
    }
    return { data };
  },

  async exportReferrals(format: ExportFormat, persist: boolean) {
    const rows = await prisma.referralRelation.findMany({
      include: {
        referrer: { select: { id: true, email: true, username: true } },
        referred: { select: { id: true, email: true, username: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    const data = rows.map((r) => ({
      referrerId: r.referrerId,
      referrerEmail: r.referrer.email,
      referredId: r.referredId,
      referredEmail: r.referred.email,
      code: r.code,
      createdAt: r.createdAt.toISOString(),
    }));
    if (persist) {
      const file = await exportFileService.writeExport("referrals", data, format);
      return { data, file };
    }
    return { data };
  },

  async exportRewardsFile(format: ExportFormat, persist: boolean) {
    const payload = await this.exportRewards();
    const flat = [
      ...payload.signInClaims.map((c) => ({ kind: "signin", ...c })),
      ...payload.pointsTransactions.map((t) => ({ kind: "points", ...t })),
      ...payload.userNfts.map((n) => ({ kind: "nft", ...n })),
    ];
    if (persist) {
      const file = await exportFileService.writeExport("rewards", flat, format);
      return { ...payload, file };
    }
    return payload;
  },

  async exportLeaderboardFile(type: LeaderboardType, format: ExportFormat, persist: boolean) {
    const payload = await this.exportLeaderboard(type);
    if (persist) {
      const file = await exportFileService.writeExport(`leaderboard-${type}`, payload.rows, format);
      return { ...payload, file };
    }
    return payload;
  },
};
