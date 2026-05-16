import { prisma } from "./prisma.js";
import { pointsService, PointsTransactionType } from "./points.service.js";
import { nftService } from "./nft.service.js";
import { badRequest, notFound } from "../errors/http-error.js";

export const taskService = {
  async listForUser(userId: string) {
    const tasks = await prisma.task.findMany({
      where: { active: true },
      include: { rewardNft: true },
      orderBy: [{ category: "asc" }, { createdAt: "asc" }],
    });

    const userTasks = await prisma.userTask.findMany({ where: { userId } });
    const byTaskId = new Map(userTasks.map((ut) => [ut.taskId, ut]));

    const now = Date.now();

    return tasks.map((task) => {
      const ut = byTaskId.get(task.id);
      const progress = ut?.progress ?? 0;
      const completed = ut?.completed ?? false;
      const onCooldown =
        task.repeatable &&
        ut?.lastCompletedAt &&
        task.cooldownHours != null &&
        now - ut.lastCompletedAt.getTime() < task.cooldownHours * 3600 * 1000;

      const canClaim =
        !onCooldown &&
        progress >= task.targetProgress &&
        (task.repeatable ? true : !completed);

      return {
        id: task.id,
        name: task.name,
        description: task.description,
        type: task.type,
        category: task.category,
        rewardPoints: task.rewardPoints,
        rewardNft: task.rewardNft
          ? {
              id: task.rewardNft.id,
              name: task.rewardNft.name,
              rarity: task.rewardNft.rarity,
              imageUrl: task.rewardNft.imageUrl,
            }
          : null,
        repeatable: task.repeatable,
        targetProgress: task.targetProgress,
        progress,
        completed,
        onCooldown: Boolean(onCooldown),
        canClaim,
        cooldownHours: task.cooldownHours,
      };
    });
  },

  async complete(userId: string, taskId: string) {
    const task = await prisma.task.findFirst({
      where: { id: taskId, active: true },
      include: { rewardNft: true },
    });
    if (!task) throw notFound("Task not found");

    let ut = await prisma.userTask.findUnique({
      where: { userId_taskId: { userId, taskId } },
    });

    if (!ut) {
      ut = await prisma.userTask.create({
        data: { userId, taskId, progress: task.targetProgress },
      });
    } else {
      const onCooldown =
        task.repeatable &&
        ut.lastCompletedAt &&
        task.cooldownHours != null &&
        Date.now() - ut.lastCompletedAt.getTime() < task.cooldownHours * 3600 * 1000;
      if (onCooldown) throw badRequest("Task is on cooldown");
      if (!task.repeatable && ut.completed) throw badRequest("Task already completed");

      const progress = Math.max(ut.progress, task.targetProgress);
      if (progress < task.targetProgress) {
        throw badRequest("Task progress not complete");
      }
    }

    const activeEvent = await prisma.event.findFirst({
      where: {
        active: true,
        startsAt: { lte: new Date() },
        endsAt: { gte: new Date() },
      },
      orderBy: { multiplier: "desc" },
    });
    const multiplier = activeEvent?.multiplier ?? 1;
    const rewardPoints = Math.floor(task.rewardPoints * multiplier);

    await prisma.$transaction(async (tx) => {
      await tx.userTask.update({
        where: { userId_taskId: { userId, taskId } },
        data: {
          progress: task.repeatable ? 0 : task.targetProgress,
          completed: !task.repeatable,
          completedAt: new Date(),
          lastCompletedAt: new Date(),
        },
      });

      await pointsService.earn(
        userId,
        rewardPoints,
        PointsTransactionType.TASK,
        { reference: taskId, note: task.name },
        tx,
      );
    });

    let nftGranted = null;
    if (task.rewardNftId) {
      nftGranted = await nftService.grantToUser(userId, task.rewardNftId, "TASK");
    }

    const { leaderboardService } = await import("./leaderboard.service.js");
    await leaderboardService.syncUserScores(userId);

    const balance = await pointsService.getBalance(userId);
    const { analyticsService } = await import("./analytics.service.js");
    void analyticsService.track("TASK_COMPLETE", { userId, metadata: { taskId } });

    return {
      taskId,
      rewardPoints,
      multiplier,
      pointsBalance: balance,
      nft: task.rewardNft
        ? {
            id: task.rewardNft.id,
            name: task.rewardNft.name,
            rarity: task.rewardNft.rarity,
          }
        : null,
      nftGranted: nftGranted ? { id: nftGranted.id } : null,
    };
  },

  /** Bump progress for repeatable/daily tasks (e.g. page view). */
  async bumpProgress(userId: string, taskId: string, amount = 1) {
    const task = await prisma.task.findFirst({ where: { id: taskId, active: true } });
    if (!task) return;

    await prisma.userTask.upsert({
      where: { userId_taskId: { userId, taskId } },
      create: { userId, taskId, progress: amount },
      update: { progress: { increment: amount } },
    });
  },
};
