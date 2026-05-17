"use client";

import { motion } from "framer-motion";
import { Button, Card, CardContent, CardHeader, CardTitle, Skeleton, toast } from "@kenba/ui";
import { useTranslations } from "next-intl";
import { useSignInClaim, useSignInStatus } from "@/hooks/use-engagement";
import { ApiClientError } from "@/lib/api-client";
import { cn } from "@kenba/ui";

export function SignInPanel() {
  const t = useTranslations("engagement");
  const { data, isLoading } = useSignInStatus();
  const claim = useSignInClaim();

  async function handleClaim() {
    try {
      const result = await claim.mutateAsync();
      toast.success(t("claimSuccess", { points: result.rewardPoints }));
    } catch (err) {
      toast.error(err instanceof ApiClientError ? err.message : t("claimFailed"));
    }
  }

  if (isLoading || !data) {
    return <Skeleton className="h-64 w-full rounded-lg" />;
  }

  return (
    <Card className="border-primary/25 bg-card/80 backdrop-blur-xl shadow-[0_0_40px_-12px_hsl(var(--primary)/0.45)]">
      <CardHeader>
        <CardTitle>{t("dailySignIn")}</CardTitle>
        <p className="text-sm text-muted-foreground">
          {t("streakDays", { count: data.streak })} · {t("cycleDay", { day: data.cycleDay || data.nextCycleDay })}
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-lg border border-primary/20 bg-background/50 p-4"
        >
          <p className="text-xs uppercase tracking-widest text-primary">{t("todayReward")}</p>
          <p className="mt-2 text-2xl font-semibold">
            +{data.preview?.rewardPoints ?? 0} {t("points")}
          </p>
          {data.preview?.nft && (
            <p className="mt-1 text-sm text-muted-foreground">
              {t("bonusNft", { name: data.preview.nft.name })}
            </p>
          )}
        </motion.div>

        <div className="grid grid-cols-6 gap-1 sm:grid-cols-10">
          {data.cycle.slice(0, 30).map((day) => {
            const claimed = day.day <= data.cycleDay && data.claimedToday;
            const current = day.day === data.nextCycleDay && !data.claimedToday;
            return (
              <div
                key={day.day}
                title={`Day ${day.day}`}
                className={cn(
                  "flex h-8 items-center justify-center rounded text-[10px] font-medium",
                  claimed && "bg-primary/30 text-primary-foreground",
                  current && "ring-1 ring-primary bg-primary/20",
                  !claimed && !current && "bg-muted/40 text-muted-foreground",
                )}
              >
                {day.day}
              </div>
            );
          })}
        </div>

        <Button
          className="w-full shadow-[0_0_24px_-8px_hsl(var(--primary)/0.7)]"
          disabled={data.claimedToday || claim.isPending}
          onClick={() => void handleClaim()}
        >
          {data.claimedToday ? t("claimedToday") : claim.isPending ? t("claiming") : t("claimNow")}
        </Button>
      </CardContent>
    </Card>
  );
}
