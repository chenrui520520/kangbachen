import { prisma } from "./prisma.js";
import { loadEnv } from "../config/env.js";
import { badRequest, notFound, unauthorized } from "../errors/http-error.js";
import { leaderboardService, type LeaderboardType } from "./leaderboard.service.js";
import { exportFileService, type ExportFormat } from "./export-file.service.js";
import { pointsService, PointsTransactionType } from "./points.service.js";

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

  async upsertShopItem(data: {
    id?: string;
    name: string;
    description?: string;
    type: string;
    costPoints: number;
    rewardNftId?: string | null;
    eventSlug?: string;
    stock: number;
    active: boolean;
  }) {
    const { id, rewardNftId, eventSlug, ...rest } = data;
    const payload = {
      ...rest,
      rewardNftId: rewardNftId ?? null,
      eventSlug: eventSlug || null,
    };
    if (id) {
      return prisma.shopItem.update({ where: { id }, data: payload, include: { rewardNft: true } });
    }
    return prisma.shopItem.create({ data: payload, include: { rewardNft: true } });
  },

  async listTasks() {
    return prisma.task.findMany({
      orderBy: { createdAt: "desc" },
      include: { rewardNft: true },
    });
  },

  async upsertTask(data: {
    id?: string;
    name: string;
    description?: string;
    type: string;
    category: string;
    rewardPoints: number;
    rewardNftId?: string | null;
    repeatable: boolean;
    cooldownHours?: number | null;
    targetProgress: number;
    active: boolean;
  }) {
    const { id, rewardNftId, cooldownHours, ...rest } = data;
    const payload = {
      ...rest,
      rewardNftId: rewardNftId ?? null,
      cooldownHours: cooldownHours ?? null,
    };
    if (id) {
      return prisma.task.update({ where: { id }, data: payload, include: { rewardNft: true } });
    }
    return prisma.task.create({ data: payload, include: { rewardNft: true } });
  },

  async listNftRewards() {
    return prisma.nFTReward.findMany({ orderBy: { createdAt: "desc" } });
  },

  async upsertNftReward(data: {
    id?: string;
    name: string;
    description?: string;
    rarity: string;
    imageUrl?: string;
  }) {
    const { id, ...rest } = data;
    if (id) return prisma.nFTReward.update({ where: { id }, data: rest });
    return prisma.nFTReward.create({ data: rest });
  },

  async listSignInRewardConfigs() {
    return prisma.signInRewardConfig.findMany({
      orderBy: { day: "asc" },
      include: { nftReward: true },
    });
  },

  async upsertSignInRewardConfig(data: {
    day: number;
    rewardPoints: number;
    nftRewardId?: string | null;
  }) {
    const nftRewardId = data.nftRewardId ?? null;
    if (nftRewardId) {
      const nft = await prisma.nFTReward.findUnique({ where: { id: nftRewardId } });
      if (!nft) throw badRequest("NFT 奖励不存在");
    }
    return prisma.signInRewardConfig.upsert({
      where: { day: data.day },
      update: { rewardPoints: data.rewardPoints, nftRewardId },
      create: { day: data.day, rewardPoints: data.rewardPoints, nftRewardId },
      include: { nftReward: true },
    });
  },

  async adjustUserPoints(data: {
    userId: string;
    mode: "add" | "deduct" | "set";
    amount: number;
    note?: string;
    adminUserId?: string;
  }) {
    const user = await prisma.user.findUnique({
      where: { id: data.userId, deletedAt: null },
      select: { id: true, points: true, email: true },
    });
    if (!user) throw notFound("用户不存在");

    const ref = `admin-${data.adminUserId ?? "system"}-${Date.now()}`;
    const note = data.note ?? "管理员调整";

    let newBalance: number;
    if (data.mode === "set") {
      const delta = data.amount - user.points;
      if (delta > 0) {
        newBalance = await pointsService.earn(user.id, delta, PointsTransactionType.ADMIN, {
          reference: ref,
          note: `${note}（设为 ${data.amount}）`,
        });
      } else if (delta < 0) {
        newBalance = await pointsService.spend(user.id, -delta, PointsTransactionType.ADMIN, {
          reference: ref,
          note: `${note}（设为 ${data.amount}）`,
        });
      } else {
        newBalance = user.points;
      }
    } else if (data.mode === "add") {
      if (data.amount <= 0) throw badRequest("增加数量须大于 0");
      newBalance = await pointsService.earn(user.id, data.amount, PointsTransactionType.ADMIN, {
        reference: ref,
        note,
      });
    } else {
      if (data.amount <= 0) throw badRequest("扣减数量须大于 0");
      newBalance = await pointsService.spend(user.id, data.amount, PointsTransactionType.ADMIN, {
        reference: ref,
        note,
      });
    }

    return { userId: user.id, email: user.email, points: newBalance };
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
