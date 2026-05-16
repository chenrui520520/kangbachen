"use client";

import { useState } from "react";
import { Badge, Card, CardContent, CardHeader, CardTitle, Skeleton, Tabs, TabsList, TabsTrigger } from "@kangba/ui";
import { useTranslations } from "next-intl";
import { useLeaderboard } from "@/hooks/use-engagement";
import { cn } from "@kangba/ui";

const types = ["points", "streak", "nft"] as const;

export function LeaderboardBoard() {
  const t = useTranslations("engagement");
  const [type, setType] = useState<(typeof types)[number]>("points");
  const { data, isLoading } = useLeaderboard(type);

  return (
    <Card className="border-border/60 bg-card/80 backdrop-blur-xl">
      <CardHeader>
        <CardTitle>{t("leaderboard")}</CardTitle>
        <Tabs value={type} onValueChange={(v) => setType(v as (typeof types)[number])}>
          <TabsList>
            <TabsTrigger value="points">{t("lbPoints")}</TabsTrigger>
            <TabsTrigger value="streak">{t("lbStreak")}</TabsTrigger>
            <TabsTrigger value="nft">{t("lbNft")}</TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>
      <CardContent className="space-y-3">
        {isLoading && <Skeleton className="h-48 w-full" />}
        {data?.currentUser && (
          <div className="rounded-lg border border-primary/30 bg-primary/10 px-4 py-2 text-sm">
            {t("yourRank", { rank: data.currentUser.rank, value: data.currentUser.value })}
          </div>
        )}
        {data?.rows.map((row) => (
          <div
            key={row.userId}
            className={cn(
              "flex items-center justify-between rounded-lg border border-border/50 px-4 py-3",
              row.rank <= 3 && "border-primary/40 bg-primary/5 shadow-[0_0_20px_-10px_hsl(var(--primary)/0.5)]",
              data.currentUser?.userId === row.userId && "ring-1 ring-primary",
            )}
          >
            <div className="flex items-center gap-3">
              <span
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold",
                  row.rank === 1 && "bg-amber-500/20 text-amber-300",
                  row.rank === 2 && "bg-slate-400/20 text-slate-200",
                  row.rank === 3 && "bg-orange-600/20 text-orange-200",
                  row.rank > 3 && "bg-muted text-muted-foreground",
                )}
              >
                {row.rank}
              </span>
              <span className="font-medium">{row.displayName}</span>
            </div>
            <Badge variant="outline">{row.value}</Badge>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
