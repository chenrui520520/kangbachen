import type { Prisma } from "@prisma/client";
import { prisma } from "./prisma.js";
import { getRedis } from "./redis.js";

export type AnalyticsEventType =
  | "PAGE_VIEW"
  | "SIGNIN"
  | "TASK_COMPLETE"
  | "REFERRAL_BIND"
  | "REWARD_CLAIM"
  | "SHOP_PURCHASE"
  | "LEADERBOARD_VIEW";

const DAILY_FIELD: Partial<Record<AnalyticsEventType, keyof typeof dailyFieldMap>> = {
  PAGE_VIEW: "pageViews",
  SIGNIN: "signIns",
  TASK_COMPLETE: "taskCompletions",
  REFERRAL_BIND: "referralBinds",
  REWARD_CLAIM: "rewardClaims",
  SHOP_PURCHASE: "shopPurchases",
};

const dailyFieldMap = {
  pageViews: "pageViews",
  signIns: "signIns",
  taskCompletions: "taskCompletions",
  referralBinds: "referralBinds",
  rewardClaims: "rewardClaims",
  shopPurchases: "shopPurchases",
} as const;

function todayDate() {
  return new Date(new Date().toISOString().slice(0, 10));
}

export const analyticsService = {
  async track(
    eventType: AnalyticsEventType,
    opts?: {
      userId?: string;
      sessionId?: string;
      path?: string;
      metadata?: Record<string, unknown>;
    },
  ) {
    await prisma.analyticsEvent.create({
      data: {
        eventType,
        userId: opts?.userId,
        sessionId: opts?.sessionId,
        path: opts?.path,
        metadata: (opts?.metadata ?? undefined) as Prisma.InputJsonValue | undefined,
      },
    });

    const field = DAILY_FIELD[eventType];
    if (field) {
      await prisma.dailyStats.upsert({
        where: { date: todayDate() },
        create: { date: todayDate(), [field]: 1 },
        update: { [field]: { increment: 1 } },
      });
    }

    if (eventType === "PAGE_VIEW" && opts?.sessionId) {
      const redis = getRedis();
      const day = todayDate().toISOString().slice(0, 10);
      const uvKey = `analytics:uv:${day}`;
      const added = await redis.sadd(uvKey, opts.sessionId);
      if (added === 1) {
        await redis.expire(uvKey, 86400 * 2);
        await prisma.dailyStats.upsert({
          where: { date: todayDate() },
          create: { date: todayDate(), uniqueVisitors: 1 },
          update: { uniqueVisitors: { increment: 1 } },
        });
      }
    }

    if (opts?.userId) {
      const dauKey = `analytics:dau:${todayDate().toISOString().slice(0, 10)}`;
      const redis = getRedis();
      const added = await redis.sadd(dauKey, opts.userId);
      if (added === 1) {
        await redis.expire(dauKey, 86400 * 2);
        await prisma.dailyStats.upsert({
          where: { date: todayDate() },
          create: { date: todayDate(), dau: 1 },
          update: { dau: { increment: 1 } },
        });
      }
    }
  },

  async getDashboard(days = 14) {
    const redis = getRedis();
    const cacheKey = `analytics:dashboard:${days}`;
    const cached = await redis.get(cacheKey);
    if (cached) return JSON.parse(cached) as Awaited<ReturnType<typeof this.buildDashboard>>;

    const data = await this.buildDashboard(days);
    await redis.setex(cacheKey, 60, JSON.stringify(data));
    return data;
  },

  async buildDashboard(days: number) {
    const since = new Date();
    since.setDate(since.getDate() - days);

    const [daily, eventBreakdown, totals] = await Promise.all([
      prisma.dailyStats.findMany({
        where: { date: { gte: since } },
        orderBy: { date: "asc" },
      }),
      prisma.analyticsEvent.groupBy({
        by: ["eventType"],
        where: { createdAt: { gte: since } },
        _count: { id: true },
      }),
      prisma.dailyStats.aggregate({
        _sum: {
          dau: true,
          signIns: true,
          taskCompletions: true,
          referralBinds: true,
          pageViews: true,
        },
        where: { date: { gte: since } },
      }),
    ]);

    return {
      generatedAt: new Date().toISOString(),
      days,
      daily: daily.map((d) => ({
        date: d.date.toISOString().slice(0, 10),
        dau: d.dau,
        signIns: d.signIns,
        taskCompletions: d.taskCompletions,
        referralBinds: d.referralBinds,
        rewardClaims: d.rewardClaims,
        shopPurchases: d.shopPurchases,
        pageViews: d.pageViews,
        uniqueVisitors: d.uniqueVisitors,
      })),
      eventBreakdown: eventBreakdown.map((e) => ({
        type: e.eventType,
        count: e._count.id,
      })),
      totals: totals._sum,
    };
  },
};
