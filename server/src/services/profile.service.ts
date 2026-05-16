import { prisma } from "./prisma.js";
import { notFound } from "../errors/http-error.js";
import { communityService } from "./community.service.js";
import { referralService } from "./referral.service.js";

export const profileService = {
  async getPublicProfile(userId: string) {
    const user = await prisma.user.findFirst({
      where: { id: userId, deletedAt: null },
      select: {
        id: true,
        username: true,
        avatarUrl: true,
        points: true,
        signInStreak: true,
        createdAt: true,
      },
    });
    if (!user) throw notFound("User not found");

    const [nfts, achievements, referralStats, community, recentActivity, campaignStats] =
      await Promise.all([
      prisma.userNFT.findMany({
        where: { userId },
        include: { nftReward: true },
        take: 12,
        orderBy: { acquiredAt: "desc" },
      }),
      prisma.userTask.findMany({
        where: { userId, completed: true },
        include: { task: true },
        take: 8,
        orderBy: { completedAt: "desc" },
      }),
      referralService.getStats(userId).catch(() => ({
        referralCount: 0,
        rewardsEarned: 0,
        totalRewardPoints: 0,
        recentReferrals: [],
      })),
      communityService.getCommunity(userId).catch(() => null),
      prisma.pointsTransaction.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: 10,
        select: { id: true, amount: true, type: true, note: true, createdAt: true },
      }),
      prisma.userCampaignProgress.groupBy({
        by: ["campaignId"],
        where: { userId, completed: true },
        _count: { id: true },
      }),
    ]);

    const campaignsCompleted = campaignStats.length;

    return {
      user: {
        ...user,
        memberSince: user.createdAt.toISOString(),
      },
      nfts: nfts.map((n) => ({
        id: n.id,
        name: n.nftReward.name,
        rarity: n.nftReward.rarity,
        imageUrl: n.nftReward.imageUrl,
        acquiredAt: n.acquiredAt.toISOString(),
      })),
      achievements: achievements.map((a) => ({
        taskName: a.task.name,
        completedAt: a.completedAt?.toISOString(),
      })),
      referral: {
        count: referralStats.referralCount,
        totalRewardPoints: referralStats.totalRewardPoints,
      },
      community: community
        ? {
            reputation: community.profile.reputation,
            inviteTierKey: community.profile.inviteTierKey,
            title: community.profile.title,
            roleName: community.profile.role?.name ?? null,
            badges: community.badges,
            campaignsCompleted,
          }
        : {
            reputation: 0,
            inviteTierKey: "initiate",
            title: null,
            roleName: null,
            badges: [],
            campaignsCompleted: 0,
          },
      lore: {
        campaignsCompleted,
        inviteTierKey: community?.profile.inviteTierKey ?? "initiate",
      },
      activity: recentActivity.map((t) => ({
        id: t.id,
        amount: t.amount,
        reason: t.note ?? t.type,
        at: t.createdAt.toISOString(),
      })),
    };
  },
};
