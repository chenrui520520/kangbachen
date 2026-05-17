"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { ReferralBindResult, ReferralMe } from "@kenba/types";
import { referralApi } from "@/lib/api-client";
import { useAuthStore } from "@/lib/stores/auth-store";

function useToken() {
  return useAuthStore((s) => s.accessToken);
}

export function useReferralMe() {
  const token = useToken();
  return useQuery({
    queryKey: ["referral", "me", token],
    queryFn: () => referralApi.me(token!),
    enabled: Boolean(token),
  });
}

export function useReferralStats() {
  const token = useToken();
  return useQuery({
    queryKey: ["referral", "stats", token],
    queryFn: () => referralApi.stats(token!),
    enabled: Boolean(token),
  });
}

export function useReferralBind() {
  const token = useToken();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (code: string) => referralApi.bind(token!, code),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["referral"] });
      void useAuthStore.getState().fetchMe();
    },
  });
}

export type { ReferralMe, ReferralBindResult };
