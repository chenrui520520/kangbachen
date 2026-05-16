import type {
  ApiError,
  ApiSuccess,
  AuthSession,
  AuthUser,
  EventItem,
  LeaderboardResponse,
  RewardsOverview,
  ShopItemDto,
  SignInClaimResult,
  SignInStatus,
  TaskItem,
  WalletNonceResponse,
  NftSummary,
  ReferralMe,
  ReferralStats,
  ReferralBindResult,
  LoreWorld,
  PublicProfile,
  DocListItem,
  CampaignSummary,
  EventSummary,
  EventDetailResponse,
} from "@kangba/types";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ?? "http://127.0.0.1:4000";

export class ApiClientError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: number,
    message: string,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = "ApiClientError";
  }
}

async function parseJson<T>(res: Response): Promise<T> {
  const text = await res.text();
  if (!text) return {} as T;
  return JSON.parse(text) as T;
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit & { accessToken?: string | null } = {},
): Promise<T> {
  const { accessToken, headers: initHeaders, ...rest } = options;
  const headers = new Headers(initHeaders);
  if (!headers.has("Content-Type") && rest.body) {
    headers.set("Content-Type", "application/json");
  }
  if (accessToken) {
    headers.set("Authorization", `Bearer ${accessToken}`);
  }

  const res = await fetch(`${API_BASE}${path}`, { ...rest, headers });
  const body = await parseJson<ApiSuccess<T> | ApiError>(res);

  if (!res.ok || !body || (body as ApiError).success === false) {
    const err = body as ApiError;
    throw new ApiClientError(
      res.status,
      err?.code ?? res.status,
      err?.message ?? res.statusText,
      err?.details,
    );
  }

  return (body as ApiSuccess<T>).data;
}

export const authApi = {
  walletNonce(address: string, chainId: number) {
    return apiFetch<WalletNonceResponse>("/api/login/wallet/nonce", {
      method: "POST",
      body: JSON.stringify({ address, chainId }),
    });
  },

  walletLogin(address: string, chainId: number, signature: string) {
    return apiFetch<AuthSession>("/api/login/wallet", {
      method: "POST",
      body: JSON.stringify({ address, chainId, signature }),
    });
  },

  emailRequest(email: string) {
    return apiFetch<{ email: string; expiresAt: string; message: string }>(
      "/api/login/email/request",
      { method: "POST", body: JSON.stringify({ email }) },
    );
  },

  emailVerify(email: string, code: string) {
    return apiFetch<AuthSession>("/api/login/email/verify", {
      method: "POST",
      body: JSON.stringify({ email, code }),
    });
  },

  twitterPlaceholder() {
    return apiFetch<never>("/api/login/twitter", { method: "POST", body: JSON.stringify({}) });
  },

  refresh(refreshToken: string) {
    return apiFetch<AuthSession>("/api/auth/refresh", {
      method: "POST",
      body: JSON.stringify({ refreshToken }),
    });
  },

  logout(refreshToken: string | null, accessToken: string | null) {
    return apiFetch<{ ok: boolean }>("/api/auth/logout", {
      method: "POST",
      body: JSON.stringify(refreshToken ? { refreshToken } : {}),
      accessToken,
    });
  },

  me(accessToken: string) {
    return apiFetch<{ user: AuthUser }>("/api/auth/me", { accessToken });
  },
};

export const engagementApi = {
  signInStatus(token: string) {
    return apiFetch<SignInStatus>("/api/signin/status", { accessToken: token });
  },
  signInClaim(token: string) {
    return apiFetch<SignInClaimResult>("/api/signin/claim", {
      method: "POST",
      accessToken: token,
      body: JSON.stringify({}),
    });
  },
  signInHistory(token: string) {
    return apiFetch<Array<{ id: string; claimDate: string; cycleDay: number; rewardPoints: number; nft: NftSummary | null }>>(
      "/api/signin/history",
      { accessToken: token },
    );
  },
  rewards(token: string) {
    return apiFetch<RewardsOverview>("/api/rewards", { accessToken: token });
  },
  tasks(token: string) {
    return apiFetch<TaskItem[]>("/api/tasks", { accessToken: token });
  },
  completeTask(token: string, taskId: string) {
    return apiFetch<{ taskId: string; rewardPoints: number; pointsBalance: number }>(
      "/api/tasks/complete",
      { method: "POST", accessToken: token, body: JSON.stringify({ taskId }) },
    );
  },
  leaderboard(token: string, type: "points" | "streak" | "nft" = "points") {
    return apiFetch<LeaderboardResponse>(`/api/leaderboard?type=${type}`, { accessToken: token });
  },
  events(token: string) {
    return apiFetch<EventItem[]>("/api/events", { accessToken: token });
  },
  shop(token: string) {
    return apiFetch<ShopItemDto[]>("/api/shop", { accessToken: token });
  },
  shopPurchase(token: string, shopItemId: string) {
    return apiFetch<{ shopItemId: string; costPoints: number; pointsBalance: number }>(
      "/api/shop/purchase",
      { method: "POST", accessToken: token, body: JSON.stringify({ shopItemId }) },
    );
  },
};

export const cmsApi = {
  bundle(locale: string) {
    return apiFetch<{
      announcements: Array<{ id: string; message: string; linkUrl: string | null }>;
      banners: Array<{ id: string; title: string; subtitle: string | null; linkUrl: string | null }>;
      faqs: Array<{ id: string; question: string; answer: string }>;
    }>(`/api/cms/bundle?locale=${locale}`);
  },
};

export const analyticsApi = {
  track(body: {
    eventType: string;
    sessionId?: string;
    path?: string;
    metadata?: Record<string, unknown>;
  }) {
    return apiFetch<null>("/api/analytics/track", {
      method: "POST",
      body: JSON.stringify(body),
    });
  },
};

export const loreApi = {
  world(locale: string) {
    return apiFetch<LoreWorld>(`/api/lore/world?locale=${locale}`);
  },
  faction(slug: string, locale: string) {
    return apiFetch<Record<string, unknown>>(`/api/lore/factions/${slug}?locale=${locale}`);
  },
  region(slug: string, locale: string) {
    return apiFetch<Record<string, unknown>>(`/api/lore/regions/${slug}?locale=${locale}`);
  },
  character(slug: string, locale: string) {
    return apiFetch<Record<string, unknown>>(`/api/lore/characters/${slug}?locale=${locale}`);
  },
  characters(locale: string) {
    return apiFetch<Array<Record<string, unknown>>>(`/api/lore/characters?locale=${locale}`);
  },
  creatures(locale: string) {
    return apiFetch<Array<Record<string, unknown>>>(`/api/lore/creatures?locale=${locale}`);
  },
  artifacts(locale: string) {
    return apiFetch<Array<Record<string, unknown>>>(`/api/lore/artifacts?locale=${locale}`);
  },
  timeline(locale: string) {
    return apiFetch<Array<Record<string, unknown>>>(`/api/lore/timeline?locale=${locale}`);
  },
};

export const docsApi = {
  list(category: string, locale: string) {
    return apiFetch<DocListItem[]>(`/api/docs/${category}?locale=${locale}`);
  },
  article(category: string, slug: string, locale: string) {
    return apiFetch<{ title: string; body: string; slug: string; category: string }>(
      `/api/docs/${category}/${slug}?locale=${locale}`,
    );
  },
  search(locale: string, q: string) {
    return apiFetch<Array<{ slug: string; category: string; title: string; excerpt: string }>>(
      `/api/docs/search?locale=${locale}&q=${encodeURIComponent(q)}`,
    );
  },
};

export const campaignApi = {
  list(locale: string) {
    return apiFetch<CampaignSummary[]>(`/api/campaigns?locale=${locale}`);
  },
  get(slug: string, locale: string, token?: string | null) {
    return apiFetch<{ campaign: CampaignSummary; progress: unknown[] }>(
      `/api/campaigns/${slug}?locale=${locale}`,
      { accessToken: token ?? null },
    );
  },
  advance(token: string, slug: string, questId: string, locale: string) {
    return apiFetch<unknown[]>(`/api/campaigns/${slug}/advance?locale=${locale}`, {
      method: "POST",
      accessToken: token,
      body: JSON.stringify({ questId }),
    });
  },
};

export const profileApi = {
  get(id: string) {
    return apiFetch<PublicProfile>(`/api/profile/${id}`);
  },
};

export const eventApi = {
  list(locale: string, token?: string | null) {
    return apiFetch<EventSummary[]>(`/api/events?locale=${locale}`, { accessToken: token ?? null });
  },
  get(slug: string, locale: string, token?: string | null) {
    return apiFetch<EventDetailResponse>(`/api/events/${slug}?locale=${locale}`, {
      accessToken: token ?? null,
    });
  },
  advance(token: string, slug: string, taskId: string, locale: string) {
    return apiFetch<unknown[]>(`/api/events/${slug}/advance?locale=${locale}`, {
      method: "POST",
      accessToken: token,
      body: JSON.stringify({ taskId }),
    });
  },
};

export const communityApi = {
  me(token: string) {
    return apiFetch<Record<string, unknown>>("/api/community/me", { accessToken: token });
  },
  invite(token: string, code: string) {
    return apiFetch<Record<string, unknown>>("/api/community/invite", {
      method: "POST",
      accessToken: token,
      body: JSON.stringify({ code }),
    });
  },
};

export const referralApi = {
  me(token: string) {
    return apiFetch<ReferralMe>("/api/referral/me", { accessToken: token });
  },
  stats(token: string) {
    return apiFetch<ReferralStats>("/api/referral/stats", { accessToken: token });
  },
  bind(token: string, code: string) {
    return apiFetch<ReferralBindResult>("/api/referral/bind", {
      method: "POST",
      accessToken: token,
      body: JSON.stringify({ code }),
    });
  },
};
