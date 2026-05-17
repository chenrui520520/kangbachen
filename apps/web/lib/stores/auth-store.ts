"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AuthSession, AuthUser } from "@kenba/types";
import { authApi } from "@/lib/api-client";

type AuthState = {
  user: AuthUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  expiresAt: number | null;
  hydrated: boolean;
  setSession: (session: AuthSession) => void;
  clearSession: () => void;
  setHydrated: (v: boolean) => void;
  refreshSession: () => Promise<boolean>;
  fetchMe: () => Promise<void>;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      expiresAt: null,
      hydrated: false,

      setSession: (session) =>
        set({
          user: session.user,
          accessToken: session.accessToken,
          refreshToken: session.refreshToken,
          expiresAt: Date.now() + session.expiresIn * 1000,
        }),

      clearSession: () =>
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          expiresAt: null,
        }),

      setHydrated: (hydrated) => set({ hydrated }),

      refreshSession: async () => {
        const { refreshToken } = get();
        if (!refreshToken) return false;
        try {
          const session = await authApi.refresh(refreshToken);
          get().setSession(session);
          return true;
        } catch {
          get().clearSession();
          return false;
        }
      },

      fetchMe: async () => {
        const { accessToken } = get();
        if (!accessToken) return;
        try {
          const { user } = await authApi.me(accessToken);
          set({ user });
        } catch {
          const ok = await get().refreshSession();
          if (ok) await get().fetchMe();
          else get().clearSession();
        }
      },
    }),
    {
      name: "KENBA-auth",
      partialize: (s) => ({
        user: s.user,
        accessToken: s.accessToken,
        refreshToken: s.refreshToken,
        expiresAt: s.expiresAt,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
    },
  ),
);

export function useIsAuthenticated() {
  const user = useAuthStore((s) => s.user);
  const accessToken = useAuthStore((s) => s.accessToken);
  return Boolean(user && accessToken);
}
