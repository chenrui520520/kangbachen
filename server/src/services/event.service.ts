import { prisma } from "./prisma.js";
import { notFound, badRequest } from "../errors/http-error.js";
import { pointsService } from "./points.service.js";
import { nftService } from "./nft.service.js";

function mapStatus(startsAt: Date, endsAt: Date, now = new Date()) {
  if (endsAt < now) return "ended" as const;
  if (startsAt > now) return "upcoming" as const;
  return "active" as const;
}

function mapNft(nft: { id: string; name: string; rarity: string; imageUrl: string | null } | null) {
  if (!nft) return null;
  return { id: nft.id, name: nft.name, rarity: nft.rarity, imageUrl: nft.imageUrl };
}

function serializeEvent(
  e: {
    id: string;
    slug: string;
    locale: string;
    name: string;
    description: string | null;
    startsAt: Date;
    endsAt: Date;
    multiplier: number;
    bannerUrl: string | null;
    featured: boolean;
    rewards: Array<{
      id: string;
      milestone: number;
      rewardPoints: number;
      nftReward: { id: string; name: string; rarity: string; imageUrl: string | null } | null;
    }>;
    tasks: Array<{
      id: string;
      stepOrder: number;
      title: string;
      description: string | null;
      taskKey: string;
      targetProgress: number;
      rewardPoints: number;
      rewardNftId: string | null;
      nftReward: { id: string; name: string; rarity: string; imageUrl: string | null } | null;
    }>;
  },
  now = new Date(),
) {
  return {
    id: e.id,
    slug: e.slug,
    locale: e.locale,
    name: e.name,
    description: e.description,
    startsAt: e.startsAt.toISOString(),
    endsAt: e.endsAt.toISOString(),
    multiplier: e.multiplier,
    bannerUrl: e.bannerUrl,
    featured: e.featured,
    status: mapStatus(e.startsAt, e.endsAt, now),
    rewards: e.rewards.map((r) => ({
      id: r.id,
      milestone: r.milestone,
      rewardPoints: r.rewardPoints,
      nft: mapNft(r.nftReward),
    })),
    tasks: e.tasks.map((t) => ({
      id: t.id,
      stepOrder: t.stepOrder,
      title: t.title,
      description: t.description,
      taskKey: t.taskKey,
      targetProgress: t.targetProgress,
      rewardPoints: t.rewardPoints,
      rewardNft: mapNft(t.nftReward),
    })),
  };
}

export const eventService = {
  eventInclude() {
    return {
      rewards: { include: { nftReward: true }, orderBy: { milestone: "asc" as const } },
      tasks: { include: { nftReward: true }, orderBy: { stepOrder: "asc" as const } },
    };
  },

  async listPublic(locale: string, userId?: string) {
    const now = new Date();
    const events = await prisma.event.findMany({
      where: {
        locale,
        active: true,
        endsAt: { gte: now },
      },
      include: this.eventInclude(),
      orderBy: [{ featured: "desc" }, { startsAt: "asc" }],
    });

    let taskProgress: Awaited<ReturnType<typeof prisma.userEventTaskProgress.findMany>> = [];
    let milestoneProgress: Awaited<ReturnType<typeof prisma.userEventProgress.findMany>> = [];
    if (userId && events.length > 0) {
      const ids = events.map((e) => e.id);
      [taskProgress, milestoneProgress] = await Promise.all([
        prisma.userEventTaskProgress.findMany({ where: { userId, eventId: { in: ids } } }),
        prisma.userEventProgress.findMany({ where: { userId, eventId: { in: ids } } }),
      ]);
    }

    const taskByEvent = new Map<string, typeof taskProgress>();
    for (const p of taskProgress) {
      const list = taskByEvent.get(p.eventId) ?? [];
      list.push(p);
      taskByEvent.set(p.eventId, list);
    }
    const milestoneByEvent = new Map(milestoneProgress.map((p) => [p.eventId, p]));

    return events.map((e) => {
      const base = serializeEvent(e);
      const tasks = taskByEvent.get(e.id) ?? [];
      const completedTasks = tasks.filter((t) => t.completed).length;
      const milestone = milestoneByEvent.get(e.id);
      return {
        ...base,
        userProgress: milestone?.progress ?? completedTasks,
        userClaimed: milestone?.claimed ?? false,
        tasksCompleted: completedTasks,
        totalTasks: e.tasks.length,
      };
    });
  },

  async listForUser(userId: string, locale = "en") {
    return this.listPublic(locale, userId);
  },

  async getEvent(slug: string, locale: string, userId?: string) {
    const event = await prisma.event.findFirst({
      where: { slug, locale, active: true },
      include: this.eventInclude(),
    });
    if (!event) throw notFound("Event not found");

    let taskProgress: Awaited<ReturnType<typeof prisma.userEventTaskProgress.findMany>> = [];
    let milestone = null;
    if (userId) {
      [taskProgress, milestone] = await Promise.all([
        prisma.userEventTaskProgress.findMany({ where: { userId, eventId: event.id } }),
        prisma.userEventProgress.findUnique({ where: { userId_eventId: { userId, eventId: event.id } } }),
      ]);
    }

    return {
      event: serializeEvent(event),
      progress: taskProgress.map((p) => ({
        taskId: p.taskId,
        progress: p.progress,
        completed: p.completed,
      })),
      milestone: milestone
        ? { progress: milestone.progress, claimed: milestone.claimed }
        : { progress: taskProgress.filter((t) => t.completed).length, claimed: false },
    };
  },

  async advanceTask(userId: string, slug: string, taskId: string, locale: string) {
    const event = await prisma.event.findFirst({
      where: { slug, locale, active: true },
      include: { tasks: true, rewards: { include: { nftReward: true } } },
    });
    if (!event) throw notFound("Event not found");

    const now = new Date();
    if (event.endsAt < now) throw badRequest("Event has ended");
    if (event.startsAt > now) throw badRequest("Event has not started");

    const task = event.tasks.find((t) => t.id === taskId);
    if (!task) throw badRequest("Invalid task");

    await prisma.userEventTaskProgress.upsert({
      where: { userId_taskId: { userId, taskId } },
      create: {
        userId,
        eventId: event.id,
        taskId,
        progress: 1,
        completed: task.targetProgress <= 1,
        completedAt: task.targetProgress <= 1 ? new Date() : null,
      },
      update: { progress: { increment: 1 } },
    });

    const row = await prisma.userEventTaskProgress.findUniqueOrThrow({
      where: { userId_taskId: { userId, taskId } },
    });

    const completed = row.progress >= task.targetProgress;
    if (completed && !row.completed) {
      await prisma.userEventTaskProgress.update({
        where: { id: row.id },
        data: { completed: true, completedAt: new Date() },
      });
      if (task.rewardPoints > 0) {
        await pointsService.earn(userId, task.rewardPoints, "EVENT", {
          reference: `event:${event.slug}:${task.taskKey}`,
          note: task.title,
        });
      }
      if (task.rewardNftId) {
        await nftService.grantToUser(userId, task.rewardNftId, `EVENT:${event.slug}`);
      }
    }

    const allProgress = await prisma.userEventTaskProgress.findMany({
      where: { userId, eventId: event.id },
    });
    const completedCount = allProgress.filter((p) => p.completed).length;

    await prisma.userEventProgress.upsert({
      where: { userId_eventId: { userId, eventId: event.id } },
      create: { userId, eventId: event.id, progress: completedCount },
      update: { progress: completedCount },
    });

    const eligible = event.rewards.filter((r) => r.milestone <= completedCount);
    const milestoneRow = await prisma.userEventProgress.findUnique({
      where: { userId_eventId: { userId, eventId: event.id } },
    });

    if (eligible.length > 0 && milestoneRow && !milestoneRow.claimed) {
      for (const reward of eligible) {
        if (reward.rewardPoints > 0) {
          await pointsService.earn(userId, reward.rewardPoints, "EVENT", {
            reference: `event-milestone:${event.slug}:${reward.milestone}`,
            note: `${event.name} milestone ${reward.milestone}`,
          });
        }
        if (reward.nftRewardId) {
          await nftService.grantToUser(userId, reward.nftRewardId, `EVENT_MILESTONE:${event.slug}`);
        }
      }
      await prisma.userEventProgress.update({
        where: { userId_eventId: { userId, eventId: event.id } },
        data: { claimed: true },
      });
    }

    return prisma.userEventTaskProgress.findMany({
      where: { userId, eventId: event.id },
    });
  },

  adminList() {
    return prisma.event.findMany({
      orderBy: { updatedAt: "desc" },
      include: this.eventInclude(),
    });
  },

  adminUpsertEvent(data: {
    id?: string;
    slug: string;
    locale: string;
    name: string;
    description?: string;
    startsAt: string;
    endsAt: string;
    multiplier?: number;
    bannerUrl?: string;
    featured?: boolean;
    active: boolean;
  }) {
    const payload = {
      slug: data.slug,
      locale: data.locale,
      name: data.name,
      description: data.description,
      startsAt: new Date(data.startsAt),
      endsAt: new Date(data.endsAt),
      multiplier: data.multiplier ?? 1,
      bannerUrl: data.bannerUrl,
      featured: data.featured ?? false,
      active: data.active,
    };
    if (data.id) return prisma.event.update({ where: { id: data.id }, data: payload });
    return prisma.event.create({ data: payload });
  },

  adminUpsertTask(data: {
    id?: string;
    eventId: string;
    stepOrder: number;
    title: string;
    description?: string;
    taskKey: string;
    targetProgress?: number;
    rewardPoints?: number;
    rewardNftId?: string | null;
  }) {
    const { id, ...rest } = data;
    if (id) return prisma.eventTask.update({ where: { id }, data: rest });
    return prisma.eventTask.create({ data: rest });
  },

  adminUpsertReward(data: {
    id?: string;
    eventId: string;
    milestone: number;
    rewardPoints?: number;
    nftRewardId?: string | null;
  }) {
    const { id, ...rest } = data;
    if (id) return prisma.eventReward.update({ where: { id }, data: rest });
    return prisma.eventReward.create({ data: rest });
  },

  async adminExportStats(eventSlug?: string) {
    const events = await prisma.event.findMany({
      where: eventSlug ? { slug: eventSlug } : undefined,
      include: {
        taskProgress: {
          include: {
            user: { select: { id: true, email: true, username: true } },
            task: { select: { taskKey: true, title: true } },
          },
        },
        userProgress: true,
      },
    });
    return events.map((e) => ({
      slug: e.slug,
      locale: e.locale,
      name: e.name,
      participants: e.userProgress.length,
      taskCompletions: e.taskProgress.filter((p) => p.completed).length,
      milestonesClaimed: e.userProgress.filter((p) => p.claimed).length,
    }));
  },
};
