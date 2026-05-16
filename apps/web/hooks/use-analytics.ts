"use client";

import { useCallback, useEffect, useMemo } from "react";
import { usePathname } from "@/i18n/navigation";
import { analyticsApi } from "@/lib/api-client";

const SESSION_KEY = "kangba_sid";

function getSessionId() {
  if (typeof window === "undefined") return undefined;
  let sid = sessionStorage.getItem(SESSION_KEY);
  if (!sid) {
    sid = crypto.randomUUID();
    sessionStorage.setItem(SESSION_KEY, sid);
  }
  return sid;
}

export function useAnalytics() {
  const pathname = usePathname();
  const sessionId = useMemo(() => getSessionId(), []);

  const track = useCallback(
    (eventType: Parameters<typeof analyticsApi.track>[0]["eventType"], metadata?: Record<string, unknown>) => {
      void analyticsApi.track({ eventType, sessionId, path: pathname, metadata }).catch(() => undefined);
    },
    [pathname, sessionId],
  );

  useEffect(() => {
    track("PAGE_VIEW");
  }, [pathname, track]);

  return { track };
}
