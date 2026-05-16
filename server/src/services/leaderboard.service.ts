import { prisma } from "./prisma.js";
import { getRedis } from "./redis.js";
import { nftService } from "./nft.service.js";

export type LeaderboardType = "points" | "streak" | "nft" | "referral";

const CACHE_TTL_SEC = 60;

function cacheKey(type: LeaderboardType) {
  return `leaderboard:${type}`;
}

export const leaderboardService = {
  async syncUserScores(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { points: true, signInStreak: true },
    });
    if (!user) return;

    const nftCount = await nftService.countUserNfts(userId);

    await this.upsertEntry(userId, "points", user.points);
    await this.upsertEntry(userId, "streak", user.signInStreak);
    await this.upsertEntry(userId, "nft", nftCount);

    const referralCount = await prisma.referralRelation.count({ where: { referrerId: userId } });
    await this.upsertEntry(userId, "referral", referralCount);

    await this.invalidateCache();
  },

  async upsertEntry(userId: string, type: LeaderboardType, value: number) {
    await prisma.leaderboardEntry.upsert({
      where: { userId_type: { userId, type } },
      create: { userId, type, value },
      update: { value, updatedAt: new Date() },
    });
  },

  async invalidateCache() {
    const redis = getRedis();
    await Promise.all(
      (["points", "streak", "nft", "referral"] as LeaderboardType[]).map((t) => redis.del(cacheKey(t))),
    );
  },

  async recalculate(type: LeaderboardType) {
    if (type === "points") {
      const users = await prisma.user.findMany({
        where: { deletedAt: null },
        select: { id: true, points: true },
      });
      for (const u of users) {
        await this.upsertEntry(u.id, type, u.points);
      }
    } else if (type === "streak") {
      const users = await prisma.user.findMany({
        where: { deletedAt: null },
        select: { id: true, signInStreak: true },
      });
      for (const u of users) {
        await this.upsertEntry(u.id, type, u.signInStreak);
      }
    } else if (type === "nft") {
      const counts = await prisma.userNFT.groupBy({
        by: ["userId"],
        _count: { id: true },
      });
      for (const c of counts) {
        await this.upsertEntry(c.userId, type, c._count.id);
      }
    } else if (type === "referral") {
      const counts = await prisma.referralRelation.groupBy({
        by: ["referrerId"],
        _count: { id: true },
      });
      for (const c of counts) {
        await this.upsertEntry(c.referrerId, type, c._count.id);
      }
    }
    await this.invalidateCache();
  },

  async getLeaderboard(type: LeaderboardType, currentUserId?: string) {
    const redis = getRedis();
    const cached = await redis.get(cacheKey(type));
    if (cached) {
      const parsed = JSON.parse(cached) as Awaited<ReturnType<typeof this.buildLeaderboard>>;
      if (currentUserId) {
        parsed.currentUser = await this.getCurrentUserRank(type, currentUserId);
      }
      return parsed;
    }

    const data = await this.buildLeaderboard(type, currentUserId);
    await redis.setex(cacheKey(type), CACHE_TTL_SEC, JSON.stringify(data));
    return data;
  },

  async buildLeaderboard(type: LeaderboardType, currentUserId?: string) {
    await this.recalculate(type);

    const entries = await prisma.leaderboardEntry.findMany({
      where: { type },
      orderBy: { value: "desc" },
      take: 100,
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true,
            avatarUrl: true,
            points: true,
            signInStreak: true,
          },
        },
      },
    });

    const rows = entries.map((e, i) => ({
      rank: i + 1,
      userId: e.userId,
      value: e.value,
      displayName:
        e.user.username ??
        (e.user.email ? e.user.email.split("@")[0] : `Player-${e.userId.slice(0, 6)}`),
      avatarUrl: e.user.avatarUrl,
    }));

    const currentUser = currentUserId
      ? await this.getCurrentUserRank(type, currentUserId)
      : null;

    return { type, rows, currentUser, updatedAt: new Date().toISOString() };
  },

  async getCurrentUserRank(type: LeaderboardType, userId: string) {
    const entry = await prisma.leaderboardEntry.findUnique({
      where: { userId_type: { userId, type } },
    });
    if (!entry) return null;

    const higher = await prisma.leaderboardEntry.count({
      where: { type, value: { gt: entry.value } },
    });

    return {
      rank: higher + 1,
      userId,
      value: entry.value,
    };
  },
};
