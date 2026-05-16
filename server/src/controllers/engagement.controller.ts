import type { FastifyReply, FastifyRequest } from "fastify";
import { leaderboardQuerySchema, taskCompleteBodySchema } from "../schemas/engagement.js";
import { sendSuccess } from "../utils/response.js";
import { signinService } from "../services/signin.service.js";
import { taskService } from "../services/task.service.js";
import { leaderboardService } from "../services/leaderboard.service.js";
import { eventService } from "../services/event.service.js";
import { pointsService } from "../services/points.service.js";
import { nftService } from "../services/nft.service.js";
import { adminService } from "../services/admin.service.js";
import { HttpError } from "../errors/http-error.js";

function userId(req: FastifyRequest) {
  const id = req.authUser?.sub;
  if (!id) throw new HttpError(401, "Unauthorized");
  return id;
}

async function run<T>(handler: () => Promise<T>, reply: FastifyReply) {
  try {
    return sendSuccess(reply, 200, await handler());
  } catch (err) {
    if (err instanceof HttpError) {
      return reply.status(err.statusCode).send({
        success: false,
        code: err.statusCode,
        message: err.message,
        details: err.details,
      });
    }
    throw err;
  }
}

export const engagementController = {
  signin: (req: FastifyRequest, reply: FastifyReply) =>
    run(() => signinService.claim(userId(req)), reply),

  rewards: (req: FastifyRequest, reply: FastifyReply) =>
    run(async () => {
      const uid = userId(req);
      const [balance, transactions, nfts, user] = await Promise.all([
        pointsService.getBalance(uid),
        pointsService.listTransactions(uid, 30),
        nftService.listUserNfts(uid),
        signinService.getStatus(uid),
      ]);
      return {
        pointsBalance: balance,
        streak: user.streak,
        cycleDay: user.cycleDay,
        transactions: transactions.map((t) => ({
          id: t.id,
          amount: t.amount,
          type: t.type,
          note: t.note,
          createdAt: t.createdAt.toISOString(),
        })),
        nfts: nfts.map((n) => ({
          id: n.id,
          acquiredAt: n.acquiredAt.toISOString(),
          source: n.source,
          nft: {
            id: n.nftReward.id,
            name: n.nftReward.name,
            rarity: n.nftReward.rarity,
            imageUrl: n.nftReward.imageUrl,
          },
        })),
      };
    }, reply),

  rewardsExport: (req: FastifyRequest, reply: FastifyReply) =>
    run(() => adminService.exportRewards(), reply),

  tasks: (req: FastifyRequest, reply: FastifyReply) =>
    run(() => taskService.listForUser(userId(req)), reply),

  tasksComplete: (req: FastifyRequest, reply: FastifyReply) =>
    run(async () => {
      const body = taskCompleteBodySchema.parse(req.body);
      return taskService.complete(userId(req), body.taskId);
    }, reply),

  recommendations: async (_req: FastifyRequest, reply: FastifyReply) =>
    sendSuccess(reply, 200, { items: [] }),

  leaderboard: (req: FastifyRequest, reply: FastifyReply) =>
    run(async () => {
      const query = leaderboardQuerySchema.parse(req.query);
      return leaderboardService.getLeaderboard(query.type, userId(req));
    }, reply),

  events: (req: FastifyRequest, reply: FastifyReply) =>
    run(() => eventService.listForUser(userId(req)), reply),
};
