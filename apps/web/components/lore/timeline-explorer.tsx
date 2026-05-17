"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { markdownToHtml } from "@/lib/markdown";
import { cn } from "@kenba/ui";

export type TimelineEvent = {
  id: string;
  slug: string;
  title: string;
  body: string;
  era: string | null;
  yearLabel: string | null;
  sortOrder: number;
  faction?: { slug: string; name: string; colorTheme: string } | null;
};

export function TimelineExplorer({ events }: { events: TimelineEvent[] }) {
  const [active, setActive] = useState(0);
  const current = events[active];

  if (!events.length) {
    return <p className="text-muted-foreground">No chronicle entries published.</p>;
  }

  return (
    <div className="grid gap-10 lg:grid-cols-[280px_1fr]">
      <ol className="relative space-y-2 border-l border-violet-500/30 pl-6">
        {events.map((e, i) => (
          <li key={e.id}>
            <button
              type="button"
              onClick={() => setActive(i)}
              className={cn(
                "w-full rounded-lg px-3 py-2 text-left text-sm transition",
                i === active
                  ? "bg-violet-950/60 text-foreground shadow-[0_0_16px_rgba(139,92,246,0.25)]"
                  : "text-muted-foreground hover:bg-muted/30",
              )}
            >
              <span className="text-xs text-violet-400">
                {[e.era, e.yearLabel].filter(Boolean).join(" · ")}
              </span>
              <span className="mt-1 block font-medium">{e.title}</span>
            </button>
          </li>
        ))}
      </ol>
      {current ? (
        <motion.article
          key={current.id}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-border/50 bg-card/40 p-8"
        >
          <p className="text-xs tracking-widest text-violet-400">
            {[current.era, current.yearLabel].filter(Boolean).join(" · ")}
            {current.faction?.name ? ` · ${current.faction.name}` : ""}
          </p>
          <h2 className="mt-2 text-2xl font-bold">{current.title}</h2>
          <div
            className="mt-6 prose-lore text-muted-foreground"
            dangerouslySetInnerHTML={{ __html: markdownToHtml(current.body) }}
          />
        </motion.article>
      ) : null}
    </div>
  );
}
