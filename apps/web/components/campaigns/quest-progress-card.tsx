"use client";

import { motion } from "framer-motion";
import { Button, cn } from "@kenba/ui";
import { usePrefersReducedMotion } from "@/hooks/use-reduced-motion";

type Quest = {
  id: string;
  stepOrder: number;
  title: string;
  description: string | null;
  rewardPoints: number;
  branchKey?: string | null;
};

export function QuestProgressCard({
  quest,
  progress,
  completed,
  canAdvance,
  onAdvance,
}: {
  quest: Quest;
  progress: number;
  completed: boolean;
  canAdvance: boolean;
  onAdvance: () => void;
}) {
  const reduced = usePrefersReducedMotion();
  const pct = completed ? 100 : Math.min(100, progress * 100);

  return (
    <motion.li
      layout={!reduced}
      initial={reduced ? false : { opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      className={cn(
        "list-none overflow-hidden rounded-xl border bg-card/50 backdrop-blur",
        completed ? "border-emerald-500/40" : "border-border/50",
      )}
    >
      <div className="p-4">
        <div className="mb-3 flex items-center justify-between gap-2 text-xs text-muted-foreground">
          <span>Step {quest.stepOrder}</span>
          {quest.branchKey ? (
            <span className="rounded-full border border-violet-500/40 px-2 py-0.5 text-violet-400">
              {quest.branchKey}
            </span>
          ) : null}
        </div>
        <h3 className="font-semibold">{quest.title}</h3>
        {quest.description ? <p className="mt-1 text-sm text-muted-foreground">{quest.description}</p> : null}
        <p className="mt-2 text-xs text-violet-400">+{quest.rewardPoints} soul fragments</p>
        <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-muted/40">
          <motion.div
            className="h-full bg-gradient-to-r from-violet-600 to-red-900"
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.6 }}
          />
        </div>
        <div className="mt-4 flex justify-end">
          {completed ? (
            <span className="text-sm font-medium text-emerald-400">Rite complete</span>
          ) : (
            <Button size="sm" disabled={!canAdvance} onClick={onAdvance}>
              Advance rite
            </Button>
          )}
        </div>
      </div>
    </motion.li>
  );
}
