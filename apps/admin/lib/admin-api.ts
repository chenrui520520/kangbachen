import { adminAuthStore } from "./admin-auth-store";

const API_BASE = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ?? "http://127.0.0.1:4000";

export type MediaCategory =
  | "illustrations"
  | "lore"
  | "banners"
  | "events"
  | "campaigns"
  | "community"
  | "cms"
  | "nft";

export type MediaAsset = {
  url: string;
  path: string;
  name: string;
  category: string;
  size: number;
  modifiedAt: string;
};

async function adminFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const token = adminAuthStore.getToken();
  const apiKey = process.env.NEXT_PUBLIC_ADMIN_API_KEY ?? "";
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(apiKey ? { "X-Admin-Key": apiKey } : {}),
      ...init?.headers,
    },
    cache: "no-store",
  });
  const json = (await res.json()) as { success: boolean; data: T; message?: string };
  if (!res.ok || !json.success) throw new Error(json.message ?? `Admin API ${res.status}`);
  return json.data;
}

export const adminApi = {
  login(email: string, password: string) {
    return adminFetch<{ token: string; user: { email: string; role: string } }>("/api/admin/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  },
  me: () => adminFetch<{ id: string; email: string; role: string }>("/api/admin/auth/me"),
  changePassword(currentPassword: string, newPassword: string) {
    return adminFetch<{ ok: boolean }>("/api/admin/auth/change-password", {
      method: "POST",
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  },
  contentOverview: () =>
    adminFetch<{ pages: number; posts: number; banners: number; faqs: number; announcements: number }>(
      "/api/admin/content/overview",
    ),
  stats: () => adminFetch<Record<string, unknown>>("/api/admin/stats/users"),
  analytics: (days = 14) => adminFetch<unknown>(`/api/admin/analytics?days=${days}`),
  systemStatus: () => adminFetch<Record<string, unknown>>("/api/admin/system/status"),
  audit: (page = 1) => adminFetch<{ total: number; rows: unknown[] }>(`/api/admin/audit?page=${page}&limit=30`),
  eventsList: () => adminFetch<unknown[]>("/api/admin/events"),
  saveEvent: (body: unknown) =>
    adminFetch<unknown>("/api/admin/events", { method: "POST", body: JSON.stringify(body) }),
  saveEventTask: (body: unknown) =>
    adminFetch<unknown>("/api/admin/events/tasks", { method: "POST", body: JSON.stringify(body) }),
  saveEventReward: (body: unknown) =>
    adminFetch<unknown>("/api/admin/events/rewards", { method: "POST", body: JSON.stringify(body) }),
  exportEventStats: (eventSlug?: string) =>
    adminFetch<unknown[]>(
      `/api/admin/events/export${eventSlug ? `?eventSlug=${encodeURIComponent(eventSlug)}` : ""}`,
    ),
  community: () => adminFetch<Record<string, unknown>>("/api/admin/community"),
  saveBadge: (body: unknown) =>
    adminFetch<unknown>("/api/admin/community/badges", { method: "POST", body: JSON.stringify(body) }),
  shop: () => adminFetch<unknown[]>("/api/admin/shop"),
  saveShopItem: (body: unknown) =>
    adminFetch<unknown>("/api/admin/shop", { method: "POST", body: JSON.stringify(body) }),
  tasks: () => adminFetch<unknown[]>("/api/admin/tasks"),
  saveTask: (body: unknown) =>
    adminFetch<unknown>("/api/admin/tasks", { method: "POST", body: JSON.stringify(body) }),
  nfts: () => adminFetch<unknown[]>("/api/admin/nfts"),
  saveNft: (body: unknown) =>
    adminFetch<unknown>("/api/admin/nfts", { method: "POST", body: JSON.stringify(body) }),
  signInRewards: () => adminFetch<unknown[]>("/api/admin/signin-rewards"),
  saveSignInReward: (body: unknown) =>
    adminFetch<unknown>("/api/admin/signin-rewards", { method: "POST", body: JSON.stringify(body) }),
  adjustUserPoints: (body: { userId: string; mode: "add" | "deduct" | "set"; amount: number; note?: string }) =>
    adminFetch<{ userId: string; email: string | null; points: number }>("/api/admin/users/points", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  referrals: (page = 1) =>
    adminFetch<{ total: number; rows: unknown[] }>(`/api/admin/referrals?page=${page}&limit=20`),
  users: (page = 1, search?: string) =>
    adminFetch<{ total: number; users: unknown[] }>(
      `/api/admin/users?page=${page}&limit=20${search ? `&search=${encodeURIComponent(search)}` : ""}`,
    ),
  uploadMedia(file: File, category: MediaCategory = "illustrations") {
    const form = new FormData();
    form.append("file", file);
    const token = adminAuthStore.getToken();
    const apiKey = process.env.NEXT_PUBLIC_ADMIN_API_KEY ?? "";
    return fetch(`${API_BASE}/api/admin/media/upload?category=${encodeURIComponent(category)}`, {
      method: "POST",
      body: form,
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(apiKey ? { "X-Admin-Key": apiKey } : {}),
      },
    }).then(async (res) => {
      const json = (await res.json()) as { success: boolean; data: MediaAsset; message?: string };
      if (!res.ok || !json.success) throw new Error(json.message ?? `Upload failed (${res.status})`);
      return json.data;
    });
  },
  listMedia: (category?: MediaCategory) =>
    adminFetch<MediaAsset[]>(
      `/api/admin/media${category ? `?category=${encodeURIComponent(category)}` : ""}`,
    ),
  cmsPages: () => adminFetch<unknown[]>("/api/admin/cms/pages"),
  savePage: (body: unknown) =>
    adminFetch<unknown>("/api/admin/cms/pages", { method: "POST", body: JSON.stringify(body) }),
  cmsPosts: () => adminFetch<unknown[]>("/api/admin/cms/posts"),
  savePost: (body: unknown) =>
    adminFetch<unknown>("/api/admin/cms/posts", { method: "POST", body: JSON.stringify(body) }),
  cmsBanners: () => adminFetch<unknown[]>("/api/admin/cms/banners"),
  saveBanner: (body: unknown) =>
    adminFetch<unknown>("/api/admin/cms/banners", { method: "POST", body: JSON.stringify(body) }),
  cmsFaqs: () => adminFetch<unknown[]>("/api/admin/cms/faq"),
  saveFaq: (body: unknown) =>
    adminFetch<unknown>("/api/admin/cms/faq", { method: "POST", body: JSON.stringify(body) }),
  cmsAnnouncements: () => adminFetch<unknown[]>("/api/admin/cms/announcements"),
  saveAnnouncement: (body: unknown) =>
    adminFetch<unknown>("/api/admin/cms/announcements", { method: "POST", body: JSON.stringify(body) }),
  exportRewards: (format: "json" | "csv") =>
    adminFetch<unknown>(`/api/admin/export/rewards?format=${format}&persist=true`),
  exportPoints: (format: "json" | "csv") =>
    adminFetch<unknown>(`/api/admin/export/points?format=${format}&persist=true`),
  exportReferrals: (format: "json" | "csv") =>
    adminFetch<unknown>(`/api/admin/export/referrals?format=${format}&persist=true`),
  exportLeaderboard: (type: string, format: "json" | "csv") =>
    adminFetch<unknown>(`/api/admin/export/leaderboard?type=${type}&format=${format}&persist=true`),
  monitoring: () => adminFetch<Record<string, unknown>>("/api/admin/monitoring"),
  loreFactions: () => adminFetch<unknown[]>("/api/admin/lore/factions"),
  saveLoreFaction: (body: unknown) =>
    adminFetch<unknown>("/api/admin/lore/factions", { method: "POST", body: JSON.stringify(body) }),
  loreCharacters: () => adminFetch<unknown[]>("/api/admin/lore/characters"),
  saveLoreCharacter: (body: unknown) =>
    adminFetch<unknown>("/api/admin/lore/characters", { method: "POST", body: JSON.stringify(body) }),
  loreTimeline: () => adminFetch<unknown[]>("/api/admin/lore/timeline"),
  saveLoreTimeline: (body: unknown) =>
    adminFetch<unknown>("/api/admin/lore/timeline", { method: "POST", body: JSON.stringify(body) }),
  docs: () => adminFetch<unknown[]>("/api/admin/docs"),
  saveDoc: (body: unknown) =>
    adminFetch<unknown>("/api/admin/docs", { method: "POST", body: JSON.stringify(body) }),
  campaigns: () => adminFetch<unknown[]>("/api/admin/campaigns"),
  saveCampaign: (body: unknown) =>
    adminFetch<unknown>("/api/admin/campaigns", { method: "POST", body: JSON.stringify(body) }),
  saveCampaignQuest: (body: unknown) =>
    adminFetch<unknown>("/api/admin/campaigns/quests", { method: "POST", body: JSON.stringify(body) }),
  deleteDoc: (id: string) => adminFetch<unknown>(`/api/admin/docs/${id}`, { method: "DELETE" }),
};
