import { prisma } from "./prisma.js";

export const nftService = {
  async listDefinitions() {
    return prisma.nFTReward.findMany({ orderBy: { rarity: "asc" } });
  },

  async getById(id: string) {
    return prisma.nFTReward.findUnique({ where: { id } });
  },

  async grantToUser(userId: string, nftRewardId: string, source: string) {
    const nft = await prisma.nFTReward.findUnique({ where: { id: nftRewardId } });
    if (!nft) return null;

    const owned = await prisma.userNFT.create({
      data: { userId, nftRewardId, source },
      include: { nftReward: true },
    });
    return owned;
  },

  async listUserNfts(userId: string) {
    return prisma.userNFT.findMany({
      where: { userId },
      include: { nftReward: true },
      orderBy: { acquiredAt: "desc" },
    });
  },

  async countUserNfts(userId: string) {
    return prisma.userNFT.count({ where: { userId } });
  },
};
