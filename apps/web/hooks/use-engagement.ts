"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { engagementApi } from "@/lib/api-client";
import { useAuthStore } from "@/lib/stores/auth-store";

function useToken() {
  return useAuthStore((s) => s.accessToken);
}

export function useSignInStatus() {
  const token = useToken();
  return useQuery({
    queryKey: ["signin", "status", token],
    queryFn: () => engagementApi.signInStatus(token!),
    enabled: Boolean(token),
  });
}

export function useSignInClaim() {
  const token = useToken();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => engagementApi.signInClaim(token!),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["signin"] });
      void qc.invalidateQueries({ queryKey: ["rewards"] });
      void qc.invalidateQueries({ queryKey: ["leaderboard"] });
      void useAuthStore.getState().fetchMe();
    },
  });
}

export function useSignInHistory() {
  const token = useToken();
  return useQuery({
    queryKey: ["signin", "history", token],
    queryFn: () => engagementApi.signInHistory(token!),
    enabled: Boolean(token),
  });
}

export function useRewards() {
  const token = useToken();
  return useQuery({
    queryKey: ["rewards", token],
    queryFn: () => engagementApi.rewards(token!),
    enabled: Boolean(token),
  });
}

export function useTasks() {
  const token = useToken();
  return useQuery({
    queryKey: ["tasks", token],
    queryFn: () => engagementApi.tasks(token!),
    enabled: Boolean(token),
  });
}

export function useCompleteTask() {
  const token = useToken();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (taskId: string) => engagementApi.completeTask(token!, taskId),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["tasks"] });
      void qc.invalidateQueries({ queryKey: ["rewards"] });
      void qc.invalidateQueries({ queryKey: ["leaderboard"] });
      void useAuthStore.getState().fetchMe();
    },
  });
}

export function useLeaderboard(type: "points" | "streak" | "nft" = "points") {
  const token = useToken();
  return useQuery({
    queryKey: ["leaderboard", type, token],
    queryFn: () => engagementApi.leaderboard(token!, type),
    enabled: Boolean(token),
  });
}

export function useEvents() {
  const token = useToken();
  return useQuery({
    queryKey: ["events", token],
    queryFn: () => engagementApi.events(token!),
    enabled: Boolean(token),
  });
}

export function useShop() {
  const token = useToken();
  return useQuery({
    queryKey: ["shop", token],
    queryFn: () => engagementApi.shop(token!),
    enabled: Boolean(token),
  });
}

export function useShopPurchase() {
  const token = useToken();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (shopItemId: string) => engagementApi.shopPurchase(token!, shopItemId),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["shop"] });
      void qc.invalidateQueries({ queryKey: ["rewards"] });
      void useAuthStore.getState().fetchMe();
    },
  });
}
