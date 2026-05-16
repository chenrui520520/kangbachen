export type NftSummary = {
  id: string;
  name: string;
  rarity: string;
  imageUrl?: string | null;
};

export type SignInStatus = {
  today: string;
  claimedToday: boolean;
  streak: number;
  cycleDay: number;
  nextCycleDay: number;
  pointsBalance: number;
  preview: {
    day: number;
    rewardPoints: number;
    nft: NftSummary | null;
  } | null;
  cycle: Array<{
    day: number;
    rewardPoints: number;
    nft: Pick<NftSummary, "id" | "name" | "rarity"> | null;
  }>;
};

export type SignInClaimResult = {
  cycleDay: number;
  streak: number;
  rewardPoints: number;
  pointsBalance: number;
  claimDate: string;
  nft: NftSummary | null;
  nftGranted: { id: string; nftRewardId: string } | null;
};

export type TaskItem = {
  id: string;
  name: string;
  description: string | null;
  type: string;
  category: string;
  rewardPoints: number;
  rewardNft: NftSummary | null;
  repeatable: boolean;
  targetProgress: number;
  progress: number;
  completed: boolean;
  onCooldown: boolean;
  canClaim: boolean;
  cooldownHours: number | null;
};

export type LeaderboardRow = {
  rank: number;
  userId: string;
  value: number;
  displayName: string;
  avatarUrl: string | null;
};

export type LeaderboardType = "points" | "streak" | "nft" | "referral";

export type LeaderboardResponse = {
  type: string;
  rows: LeaderboardRow[];
  currentUser: { rank: number; userId: string; value: number } | null;
  updatedAt: string;
};

export type EventItem = {
  id: string;
  slug?: string;
  locale?: string;
  name: string;
  description: string | null;
  startsAt: string;
  endsAt: string;
  multiplier: number;
  bannerUrl: string | null;
  featured: boolean;
  status: string;
  rewards: Array<{
    id: string;
    milestone: number;
    rewardPoints: number;
    nft: NftSummary | null;
  }>;
  userProgress: number;
  userClaimed: boolean;
  tasks?: Array<{
    id: string;
    stepOrder: number;
    title: string;
    description: string | null;
    taskKey: string;
    targetProgress: number;
    rewardPoints: number;
  }>;
  tasksCompleted?: number;
  totalTasks?: number;
};

export type ShopItemDto = {
  id: string;
  name: string;
  description: string | null;
  type: string;
  costPoints: number;
  stock: number;
  eventSlug?: string | null;
  rewardNft: NftSummary | null;
};

export type RewardsOverview = {
  pointsBalance: number;
  streak: number;
  cycleDay: number;
  transactions: Array<{
    id: string;
    amount: number;
    type: string;
    note: string | null;
    createdAt: string;
  }>;
  nfts: Array<{
    id: string;
    acquiredAt: string;
    source: string;
    nft: NftSummary;
  }>;
};
