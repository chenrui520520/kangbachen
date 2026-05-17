"use client";

import { useEffect, useState } from "react";
import { Badge, Button, Card, CardContent, CardHeader, CardTitle, Input, Skeleton, toast } from "@kenba/ui";
import { useTranslations } from "next-intl";
import { useReferralBind, useReferralMe } from "@/hooks/use-referral";
import { ApiClientError } from "@/lib/api-client";
import { clearPendingReferral, readPendingReferral, savePendingReferral } from "@/lib/referral-pending";
import { GlowCard } from "@/components/fx/glow-card";

export function InvitePanel({ initialRef }: { initialRef?: string }) {
  const t = useTranslations("referral");
  const { data, isLoading } = useReferralMe();
  const bind = useReferralBind();
  const [bindCode, setBindCode] = useState(initialRef ?? "");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (initialRef) savePendingReferral(initialRef);
    else {
      const pending = readPendingReferral();
      if (pending) setBindCode(pending);
    }
  }, [initialRef]);

  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const fullInviteUrl = data?.code ? `${origin}/invite?ref=${data.code}` : "";

  async function handleCopy() {
    if (!fullInviteUrl) return;
    await navigator.clipboard.writeText(fullInviteUrl);
    setCopied(true);
    toast.success(t("copied"));
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleBind() {
    try {
      const res = await bind.mutateAsync(bindCode);
      clearPendingReferral();
      toast.success(t("bindSuccess", { points: res.rewardPoints }));
    } catch (err) {
      toast.error(err instanceof ApiClientError ? err.message : t("bindFailed"));
    }
  }

  if (isLoading) return <Skeleton className="h-64 w-full" />;

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card className="border-primary/25 bg-card/80 backdrop-blur-xl">
        <CardHeader>
          <CardTitle>{t("yourCode")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="font-mono text-3xl font-bold tracking-widest text-primary">{data?.code ?? "—"}</p>
          <div className="flex flex-wrap gap-2">
            <Button onClick={() => void handleCopy()} disabled={!fullInviteUrl}>
              {copied ? t("copied") : t("copyLink")}
            </Button>
          </div>
          <p className="break-all text-xs text-muted-foreground">{fullInviteUrl}</p>
        </CardContent>
      </Card>

      <GlowCard>
        <h3 className="text-lg font-semibold">{t("statsTitle")}</h3>
        <div className="mt-4 grid grid-cols-2 gap-4">
          <div>
            <p className="text-2xl font-bold">{data?.stats.referralCount ?? 0}</p>
            <p className="text-xs text-muted-foreground">{t("referralCount")}</p>
          </div>
          <div>
            <p className="text-2xl font-bold">{data?.stats.totalRewardPoints ?? 0}</p>
            <p className="text-xs text-muted-foreground">{t("rewardPoints")}</p>
          </div>
        </div>
        {data?.referredBy && (
          <Badge variant="secondary" className="mt-4">
            {t("referredBy", { name: data.referredBy.displayName })}
          </Badge>
        )}
      </GlowCard>

      {!data?.referredBy && (
        <Card className="border-border/60 bg-card/70 backdrop-blur-md lg:col-span-2">
          <CardHeader>
            <CardTitle>{t("bindTitle")}</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 sm:flex-row">
            <Input
              value={bindCode}
              onChange={(e) => setBindCode(e.target.value.toUpperCase())}
              placeholder={t("bindPlaceholder")}
              className="font-mono uppercase"
            />
            <Button disabled={bind.isPending || !bindCode} onClick={() => void handleBind()}>
              {t("bindCta")}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
