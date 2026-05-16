"use client";

import { motion } from "framer-motion";
import { useAuthStore } from "@/lib/stores/auth-store";
import { eventApi } from "@/lib/api-client";
import type { EventSummary } from "@kangba/types";
import { useState } from "react";
import { CampaignCountdown } from "@/components/campaigns/campaign-countdown";
import { QuestProgressCard } from "@/components/campaigns/quest-progress-card";
import { AmbientPlayer } from "@/components/audio/ambient-player";
import { Badge } from "@kangba/ui";

type ProgressRow = { taskId: string; progress: number; completed: boolean };

export function EventDetail({
  event,
  progress,
  milestone,
  slug,
  locale,
}: {
  event: EventSummary;
  progress: ProgressRow[];
  milestone: { progress: number; claimed: boolean };
  slug: string;
  locale: string;
}) {
  const accessToken = useAuthStore((s) => s.accessToken);
  const [rows, setRows] = useState(progress);
  const [milestoneState, setMilestoneState] = useState(milestone);
  const completedCount = rows.filter((r) => r.completed).length;
  const total = event.tasks.length;
  const overallPct = total ? Math.round((completedCount / total) * 100) : 0;

  async function advance(taskId: string) {
    if (!accessToken) return;
    const next = await eventApi.advance(accessToken, slug, taskId, locale);
    setRows(
      (next as Array<{ taskId: string; progress: number; completed: boolean }>).map((p) => ({
        taskId: p.taskId,
        progress: p.progress,
        completed: p.completed,
      })),
    );
    const done = (next as Array<{ completed: boolean }>).filter((p) => p.completed).length;
    setMilestoneState((m) => ({ progress: done, claimed: m.claimed || done >= total }));
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="relative min-h-[70vh]"
    >
      <AmbientPlayer />
      <motion.div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(220,38,38,0.12),transparent_55%)]" />
      <motion.div className="relative mx-auto max-w-3xl px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-red-900/40 bg-gradient-to-br from-red-950/40 via-card/80 to-black/60 p-8 shadow-[0_0_48px_-12px_rgba(127,29,29,0.45)]"
        >
          <p className="text-xs tracking-[0.35em] text-red-400">LIVE CHRONICLE</p>
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <h1 className="text-3xl font-bold md:text-4xl">{event.name}</h1>
            {event.multiplier > 1 ? (
              <Badge variant="secondary">{event.multiplier}× soul tithe</Badge>
            ) : null}
          </div>
          <p className="mt-4 text-muted-foreground">{event.description}</p>
          <CampaignCountdown endsAt={event.endsAt} />
          <div className="mt-6">
            <motion.div className="flex justify-between text-xs text-muted-foreground">
              <span>Chronicle progress</span>
              <span>
                {overallPct}% · {completedCount}/{total}
                {milestoneState.claimed ? " · rewards claimed" : ""}
              </span>
            </motion.div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted/30">
              <div
                className="h-full bg-gradient-to-r from-red-800 to-violet-600 transition-all duration-500"
                style={{ width: `${overallPct}%` }}
              />
            </div>
          </div>
          {event.rewards.length > 0 ? (
            <ul className="mt-6 space-y-2 text-sm text-muted-foreground">
              {event.rewards.map((r) => (
                <li key={r.id}>
                  Milestone {r.milestone}: +{r.rewardPoints} fragments
                  {r.nft ? ` · ${r.nft.name}` : ""}
                </li>
              ))}
            </ul>
          ) : null}
        </motion.div>
        <ol className="mt-10 flex flex-col gap-4">
          {event.tasks.map((q) => {
            const p = rows.find((r) => r.taskId === q.id);
            return (
              <QuestProgressCard
                key={q.id}
                quest={q}
                progress={
                  p && q.targetProgress > 1
                    ? Math.min(1, p.progress / q.targetProgress)
                    : p?.progress ?? 0
                }
                completed={p?.completed ?? false}
                canAdvance={!!accessToken && !(p?.completed ?? false)}
                onAdvance={() => void advance(q.id)}
              />
            );
          })}
        </ol>
      </motion.div>
    </motion.div>
  );
}
