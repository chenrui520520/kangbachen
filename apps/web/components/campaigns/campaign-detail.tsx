"use client";

import { useAuthStore } from "@/lib/stores/auth-store";
import { campaignApi } from "@/lib/api-client";
import type { CampaignSummary } from "@kangba/types";
import { useState } from "react";
import { CampaignCountdown } from "./campaign-countdown";
import { QuestProgressCard } from "./quest-progress-card";
import { AmbientPlayer } from "@/components/audio/ambient-player";

type ProgressRow = { questId: string; progress: number; completed: boolean };

export function CampaignDetail({
  campaign,
  progress,
  slug,
  locale,
}: {
  campaign: CampaignSummary;
  progress: ProgressRow[];
  slug: string;
  locale: string;
}) {
  const accessToken = useAuthStore((s) => s.accessToken);
  const [rows, setRows] = useState(progress);
  const completedCount = rows.filter((r) => r.completed).length;
  const total = campaign.quests.length;
  const overallPct = total ? Math.round((completedCount / total) * 100) : 0;

  async function advance(questId: string) {
    if (!accessToken) return;
    const next = await campaignApi.advance(accessToken, slug, questId, locale);
    setRows(next as ProgressRow[]);
  }

  return (
    <div className="relative min-h-[70vh]">
      <AmbientPlayer />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(88,28,135,0.18),transparent_55%)]" />
      <div className="relative mx-auto max-w-3xl px-6 py-12">
        <div className="rounded-2xl border border-violet-500/30 bg-gradient-to-br from-violet-950/50 via-card/80 to-black/60 p-8 shadow-[0_0_48px_-12px_rgba(139,92,246,0.4)]">
          <p className="text-xs tracking-[0.35em] text-violet-400">LIMITED CHRONICLE</p>
          <h1 className="mt-2 text-3xl font-bold md:text-4xl">{campaign.name}</h1>
          <p className="mt-4 text-muted-foreground">{campaign.description}</p>
          {campaign.narrative ? (
            <p className="mt-4 border-l-2 border-violet-500/50 pl-4 italic text-sm text-violet-200/90">
              {campaign.narrative}
            </p>
          ) : null}
          <CampaignCountdown endsAt={campaign.endsAt} />
          <div className="mt-6">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Rite progress</span>
              <span>{overallPct}% · {completedCount}/{total}</span>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted/30">
              <div
                className="h-full bg-gradient-to-r from-violet-500 to-red-800 transition-all duration-500"
                style={{ width: `${overallPct}%` }}
              />
            </div>
          </div>
        </div>
        <ol className="mt-10 flex flex-col gap-4">
          {campaign.quests.map((q) => {
            const p = rows.find((r) => r.questId === q.id);
            return (
              <QuestProgressCard
                key={q.id}
                quest={q}
                progress={p?.progress ?? 0}
                completed={p?.completed ?? false}
                canAdvance={!!accessToken && !(p?.completed ?? false)}
                onAdvance={() => void advance(q.id)}
              />
            );
          })}
        </ol>
      </div>
    </div>
  );
}
