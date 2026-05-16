export type LoreFactionSummary = {
  id: string;
  slug: string;
  name: string;
  tagline: string | null;
  imageUrl: string | null;
  colorTheme: string;
  motto: string | null;
};

export type LoreWorld = {
  factions: LoreFactionSummary[];
  regions: { id: string; slug: string; name: string; mapX: number; mapY: number; factionId: string | null; imageUrl: string | null }[];
  timeline: { id: string; slug: string; title: string; era: string | null; yearLabel: string | null; sortOrder: number; factionId: string | null }[];
};

export type PublicProfile = {
  user: {
    id: string;
    username: string | null;
    avatarUrl: string | null;
    points: number;
    signInStreak: number;
    memberSince: string;
  };
  nfts: { id: string; name: string; rarity: string; imageUrl: string | null; acquiredAt: string }[];
  achievements: { taskName: string; completedAt: string | undefined }[];
  referral: { count: number; totalRewardPoints: number };
  community: {
    reputation: number;
    inviteTierKey: string;
    title: string | null;
    roleName?: string | null;
    campaignsCompleted?: number;
    badges: {
      key: string;
      name: string;
      description: string | null;
      rarity: string;
      imageUrl: string | null;
      frameStyle: string | null;
      grantedAt: string;
    }[];
  };
  lore?: {
    campaignsCompleted: number;
    inviteTierKey: string;
  };
  activity: { id: string; amount: number; reason: string | null; at: string }[];
};

export type DocListItem = {
  id: string;
  slug: string;
  title: string;
  seoDescription: string | null;
  sortOrder: number;
  version: number;
};

export type CampaignSummary = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  narrative?: string | null;
  bannerUrl: string | null;
  startsAt: string;
  endsAt: string;
  featured: boolean;
  quests: {
    id: string;
    stepOrder: number;
    title: string;
    description: string | null;
    taskKey: string;
    targetProgress: number;
    rewardPoints: number;
  }[];
};
