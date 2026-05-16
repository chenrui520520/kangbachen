/** Shared domain types (keep lightweight; prefer Prisma types in server). */

export type Locale = "en" | "zh" | "ko" | "ja" | "ar";

export type LeaderboardType = "points" | "nft_collected";

export type {
  ApiError,
  ApiSuccess,
  AuthSession,
  AuthTokens,
  AuthUser,
  AuthWalletAccount,
  WalletNonceResponse,
} from "./auth";

export type {
  EventItem,
  LeaderboardResponse,
  LeaderboardRow,
  NftSummary,
  RewardsOverview,
  ShopItemDto,
  SignInClaimResult,
  SignInStatus,
  TaskItem,
} from "./engagement";

export type { ReferralBindResult, ReferralMe, ReferralStats } from "./referral";

export type {
  LoreFactionSummary,
  LoreWorld,
  PublicProfile,
  DocListItem,
  CampaignSummary,
} from "./phase6";

export type { EventSummary, EventDetailResponse, EventTaskDto } from "./events";
