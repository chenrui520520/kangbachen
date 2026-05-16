import { prisma } from "./prisma.js";
import { pointsService, PointsTransactionType } from "./points.service.js";
import { nftService } from "./nft.service.js";
import { badRequest, notFound } from "../errors/http-error.js";

export const shopService = {
  async listItems(eventSlug?: string) {
    const now = new Date();
    const items = await prisma.shopItem.findMany({
      where: {
        active: true,
        ...(eventSlug
          ? { OR: [{ eventSlug: null }, { eventSlug }] }
          : {}),
        AND: [
          { OR: [{ availableFrom: null }, { availableFrom: { lte: now } }] },
          { OR: [{ availableTo: null }, { availableTo: { gte: now } }] },
        ],
      },
      include: { rewardNft: true },
      orderBy: { costPoints: "asc" },
    });

    return items.map((item) => ({
      id: item.id,
      name: item.name,
      description: item.description,
      type: item.type,
      costPoints: item.costPoints,
      stock: item.stock,
      eventSlug: item.eventSlug,
      rewardNft: item.rewardNft
        ? {
            id: item.rewardNft.id,
            name: item.rewardNft.name,
            rarity: item.rewardNft.rarity,
            imageUrl: item.rewardNft.imageUrl,
          }
        : null,
    }));
  },

  async purchase(userId: string, shopItemId: string) {
    const item = await prisma.shopItem.findFirst({
      where: { id: shopItemId, active: true },
      include: { rewardNft: true },
    });
    if (!item) throw notFound("Shop item not found");
    if (item.stock <= 0) throw badRequest("Out of stock");

    const balance = await pointsService.getBalance(userId);
    if (balance < item.costPoints) throw badRequest("Insufficient points");

    await prisma.$transaction(async (tx) => {
      await tx.shopItem.update({
        where: { id: shopItemId },
        data: { stock: { decrement: 1 } },
      });

      await tx.shopOrder.create({
        data: {
          userId,
          shopItemId,
          costPoints: item.costPoints,
          status: "completed",
        },
      });

      await tx.userShopPurchase.create({
        data: { userId, shopItemId },
      });

      await pointsService.spend(
        userId,
        item.costPoints,
        PointsTransactionType.SHOP,
        { reference: shopItemId, note: item.name },
        tx,
      );
    });

    let nftGranted = null;
    if (item.rewardNftId) {
      nftGranted = await nftService.grantToUser(userId, item.rewardNftId, "SHOP");
    }

    const { leaderboardService } = await import("./leaderboard.service.js");
    await leaderboardService.syncUserScores(userId);

    return {
      shopItemId,
      costPoints: item.costPoints,
      pointsBalance: await pointsService.getBalance(userId),
      nft: item.rewardNft
        ? {
            id: item.rewardNft.id,
            name: item.rewardNft.name,
            rarity: item.rewardNft.rarity,
          }
        : null,
      nftGranted: nftGranted ? { id: nftGranted.id } : null,
    };
  },
};
