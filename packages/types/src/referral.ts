export type ReferralMe = {
  code: string;
  inviteUrl: string;
  referredBy: {
    userId: string;
    displayName: string;
    boundAt: string;
  } | null;
  stats: ReferralStats;
};

export type ReferralStats = {
  referralCount: number;
  rewardsEarned: number;
  totalRewardPoints: number;
  recentReferrals: Array<{
    userId: string;
    displayName: string;
    joinedAt: string;
  }>;
};

export type ReferralBindResult = {
  bound: boolean;
  referrerId: string;
  rewardPoints: number;
};
