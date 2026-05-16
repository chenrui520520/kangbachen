import type { NftSummary } from "./engagement.js";

export type EventTaskDto = {
  id: string;
  stepOrder: number;
  title: string;
  description: string | null;
  taskKey: string;
  targetProgress: number;
  rewardPoints: number;
  rewardNft: NftSummary | null;
};

export type EventSummary = {
  id: string;
  slug: string;
  locale: string;
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
  tasks: EventTaskDto[];
  userProgress?: number;
  userClaimed?: boolean;
  tasksCompleted?: number;
  totalTasks?: number;
};

export type EventDetailResponse = {
  event: EventSummary;
  progress: Array<{ taskId: string; progress: number; completed: boolean }>;
  milestone: { progress: number; claimed: boolean };
};
