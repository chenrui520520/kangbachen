import { prisma } from "./prisma.js";
import { notFound, badRequest } from "../errors/http-error.js";
import { pointsService } from "./points.service.js";

export const campaignService = {
  listPublic(locale: string) {
    const now = new Date();
    return prisma.campaign.findMany({
      where: {
        locale,
        active: true,
        startsAt: { lte: now },
        endsAt: { gte: now },
      },
      orderBy: [{ featured: "desc" }, { startsAt: "desc" }],
      include: {
        quests: { orderBy: { stepOrder: "asc" } },
      },
    });
  },

  async getCampaign(slug: string, locale: string, userId?: string) {
    const campaign = await prisma.campaign.findFirst({
      where: { slug, locale, active: true },
      include: { quests: { orderBy: { stepOrder: "asc" } } },
    });
    if (!campaign) throw notFound("Campaign not found");

    let progress: Awaited<ReturnType<typeof prisma.userCampaignProgress.findMany>> = [];
    if (userId) {
      progress = await prisma.userCampaignProgress.findMany({
        where: { userId, campaignId: campaign.id },
      });
    }

    return { campaign, progress };
  },

  async advanceQuest(userId: string, campaignSlug: string, questId: string, locale: string) {
    const campaign = await prisma.campaign.findFirst({
      where: { slug: campaignSlug, locale, active: true },
      include: { quests: true },
    });
    if (!campaign) throw notFound("Campaign not found");

    const quest = campaign.quests.find((q) => q.id === questId);
    if (!quest) throw badRequest("Invalid quest");

    const row = await prisma.userCampaignProgress.upsert({
      where: { userId_questId: { userId, questId } },
      create: {
        userId,
        campaignId: campaign.id,
        questId,
        progress: 1,
        completed: quest.targetProgress <= 1,
        completedAt: quest.targetProgress <= 1 ? new Date() : null,
      },
      update: {
        progress: { increment: 1 },
      },
    });

    const completed = row.progress >= quest.targetProgress;
    if (completed && !row.completed) {
      await prisma.userCampaignProgress.update({
        where: { id: row.id },
        data: { completed: true, completedAt: new Date() },
      });
      if (quest.rewardPoints > 0) {
        await pointsService.earn(userId, quest.rewardPoints, "EVENT", {
          reference: `campaign:${campaign.slug}:${quest.taskKey}`,
          note: quest.title,
        });
      }
    }

    return prisma.userCampaignProgress.findMany({
      where: { userId, campaignId: campaign.id },
    });
  },

  // Admin
  adminList() {
    return prisma.campaign.findMany({
      orderBy: { updatedAt: "desc" },
      include: { quests: { orderBy: { stepOrder: "asc" } } },
    });
  },

  adminUpsertCampaign(data: {
    id?: string;
    slug: string;
    locale: string;
    name: string;
    description?: string;
    narrative?: string;
    bannerUrl?: string;
    startsAt: string;
    endsAt: string;
    active: boolean;
    featured?: boolean;
  }) {
    const payload = {
      ...data,
      startsAt: new Date(data.startsAt),
      endsAt: new Date(data.endsAt),
    };
    const { id, ...rest } = payload;
    if (id) return prisma.campaign.update({ where: { id }, data: rest });
    return prisma.campaign.create({ data: rest });
  },

  adminUpsertQuest(data: {
    id?: string;
    campaignId: string;
    stepOrder: number;
    title: string;
    description?: string;
    taskKey: string;
    targetProgress?: number;
    rewardPoints?: number;
    branchKey?: string;
  }) {
    const { id, ...rest } = data;
    if (id) return prisma.campaignQuest.update({ where: { id }, data: rest });
    return prisma.campaignQuest.create({ data: rest });
  },
};
