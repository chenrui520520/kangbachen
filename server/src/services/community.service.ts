import { prisma } from "./prisma.js";
import { referralService } from "./referral.service.js";

const TIER_KEYS = ["initiate", "scout", "warlord", "sovereign"] as const;

export const communityService = {
  async ensureProfile(userId: string) {
    let profile = await prisma.userCommunityProfile.findUnique({ where: { userId } });
    if (profile) return profile;
    profile = await prisma.userCommunityProfile.create({
      data: { userId },
    });
    return profile;
  },

  async syncBadgesAndTier(userId: string) {
    await this.ensureProfile(userId);
    const stats = await referralService.getStats(userId);
    const count = stats.referralCount;

    const tiers = await prisma.inviteTier.findMany({ orderBy: { minReferrals: "desc" } });
    const tier = tiers.find((t) => count >= t.minReferrals) ?? tiers[tiers.length - 1];
    const tierKey = tier?.key ?? "initiate";

    await prisma.userCommunityProfile.update({
      where: { userId },
      data: {
        inviteTierKey: tierKey,
        reputation: count * 25 + (stats.totalRewardPoints ?? 0) / 10,
      },
    });

    const badgeKeys: string[] = ["og"];
    if (count >= 1) badgeKeys.push("recruiter");
    if (count >= 5) badgeKeys.push("alpha-tester");
    if (count >= 10) badgeKeys.push("warlord-inviter");

    const badges = await prisma.badge.findMany({ where: { key: { in: badgeKeys } } });
    for (const badge of badges) {
      await prisma.userBadge.upsert({
        where: { userId_badgeId: { userId, badgeId: badge.id } },
        update: {},
        create: { userId, badgeId: badge.id, source: "MILESTONE" },
      });
    }

    return this.getCommunity(userId);
  },

  async getCommunity(userId: string) {
    const [profile, userBadges, user] = await Promise.all([
      this.ensureProfile(userId),
      prisma.userBadge.findMany({
        where: { userId },
        include: { badge: true },
        orderBy: { grantedAt: "desc" },
      }),
      prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, username: true, avatarUrl: true, points: true, signInStreak: true, createdAt: true },
      }),
    ]);

    const role = profile.roleId
      ? await prisma.communityRole.findUnique({ where: { id: profile.roleId } })
      : null;
    const alphaPass = profile.alphaPassId
      ? await prisma.alphaPass.findUnique({ where: { id: profile.alphaPassId } })
      : null;

    return {
      user,
      profile: {
        reputation: profile.reputation,
        inviteTierKey: profile.inviteTierKey,
        title: profile.title,
        role,
        alphaPass,
      },
      badges: userBadges.map((ub) => ({
        key: ub.badge.key,
        name: ub.badge.name,
        description: ub.badge.description,
        rarity: ub.badge.rarity,
        imageUrl: ub.badge.imageUrl,
        frameStyle: ub.badge.frameStyle,
        grantedAt: ub.grantedAt.toISOString(),
      })),
    };
  },

  listBadges() {
    return prisma.badge.findMany({ orderBy: { name: "asc" } });
  },

  async bindInvite(userId: string, code: string) {
    const result = await referralService.bind(userId, code);
    await this.syncBadgesAndTier(userId);
    return { ...result, community: await this.getCommunity(userId) };
  },

  adminOverview() {
    return Promise.all([
      prisma.communityRole.findMany({ orderBy: { name: "asc" } }),
      prisma.inviteTier.findMany({ orderBy: { sortOrder: "asc" } }),
      prisma.badge.findMany({ orderBy: { name: "asc" } }),
      prisma.alphaPass.findMany(),
    ]).then(([roles, inviteTiers, badges, alphaPasses]) => ({
      roles,
      inviteTiers,
      badges,
      alphaPasses,
    }));
  },

  adminUpsertBadge(data: {
    id?: string;
    key: string;
    name: string;
    description?: string;
    rarity?: string;
    imageUrl?: string;
    frameStyle?: string;
  }) {
    const { id, ...rest } = data;
    if (id) return prisma.badge.update({ where: { id }, data: rest });
    return prisma.badge.upsert({
      where: { key: data.key },
      update: rest,
      create: rest,
    });
  },

  adminUpsertInviteTier(data: {
    id?: string;
    key: string;
    name: string;
    minReferrals: number;
    sortOrder?: number;
  }) {
    const { id, ...rest } = data;
    if (id) return prisma.inviteTier.update({ where: { id }, data: rest });
    return prisma.inviteTier.upsert({
      where: { key: data.key },
      update: rest,
      create: rest,
    });
  },
};
