"use client";

import { useCallback } from "react";
import { authApi } from "@/lib/api-client";
import { useAuthStore } from "@/lib/stores/auth-store";

/** Sign out without requiring Wagmi (safe before Web3 loads). */
export function useAuthSignOut() {
  const clearSession = useAuthStore((s) => s.clearSession);
  const refreshToken = useAuthStore((s) => s.refreshToken);
  const accessToken = useAuthStore((s) => s.accessToken);

  return useCallback(async () => {
    try {
      if (refreshToken || accessToken) {
        await authApi.logout(refreshToken, accessToken);
      }
    } catch {
      // ignore
    }
    clearSession();
  }, [accessToken, clearSession, refreshToken]);
}
