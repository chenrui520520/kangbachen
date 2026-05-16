import type { Prisma } from "@prisma/client";
import { prisma } from "./prisma.js";
import { badRequest } from "../errors/http-error.js";

export const PointsTransactionType = {
  SIGNIN: "SIGNIN",
  TASK: "TASK",
  EVENT: "EVENT",
  SHOP: "SHOP",
  ADMIN: "ADMIN",
  REFERRAL: "REFERRAL",
} as const;

export type PointsTransactionTypeValue =
  (typeof PointsTransactionType)[keyof typeof PointsTransactionType];

export const pointsService = {
  async getBalance(userId: string): Promise<number> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { points: true },
    });
    return user?.points ?? 0;
  },

  async earn(
    userId: string,
    amount: number,
    type: PointsTransactionTypeValue,
    meta?: { reference?: string; note?: string },
    tx?: Prisma.TransactionClient,
  ) {
    if (amount <= 0) throw badRequest("Earn amount must be positive");
    const db = tx ?? prisma;
    await db.pointsTransaction.create({
      data: {
        userId,
        amount,
        type,
        reference: meta?.reference,
        note: meta?.note,
      },
    });
    await db.user.update({
      where: { id: userId },
      data: { points: { increment: amount } },
    });
    return this.getBalance(userId);
  },

  async spend(
    userId: string,
    amount: number,
    type: PointsTransactionTypeValue,
    meta?: { reference?: string; note?: string },
    tx?: Prisma.TransactionClient,
  ) {
    if (amount <= 0) throw badRequest("Spend amount must be positive");
    const db = tx ?? prisma;
    const user = await db.user.findUnique({ where: { id: userId }, select: { points: true } });
    if (!user || user.points < amount) {
      throw badRequest("Insufficient points");
    }
    await db.pointsTransaction.create({
      data: {
        userId,
        amount: -amount,
        type,
        reference: meta?.reference,
        note: meta?.note,
      },
    });
    await db.user.update({
      where: { id: userId },
      data: { points: { decrement: amount } },
    });
    return this.getBalance(userId);
  },

  async listTransactions(userId: string, limit = 50) {
    return prisma.pointsTransaction.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: limit,
    });
  },
};
