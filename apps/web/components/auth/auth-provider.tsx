"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/lib/stores/auth-store";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const hydrated = useAuthStore((s) => s.hydrated);
  const accessToken = useAuthStore((s) => s.accessToken);
  const expiresAt = useAuthStore((s) => s.expiresAt);
  const refreshSession = useAuthStore((s) => s.refreshSession);
  const fetchMe = useAuthStore((s) => s.fetchMe);

  useEffect(() => {
    if (!hydrated || !accessToken) return;

    const now = Date.now();
    const needsRefresh = expiresAt != null && expiresAt - now < 60_000;

    void (async () => {
      if (needsRefresh) {
        const ok = await refreshSession();
        if (!ok) return;
      }
      await fetchMe();
    })();
  }, [hydrated, accessToken, expiresAt, refreshSession, fetchMe]);

  return children;
}
