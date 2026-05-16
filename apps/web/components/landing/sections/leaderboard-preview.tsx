"use client";

import { useTranslations } from "next-intl";
import { Button } from "@kangba/ui";
import { Link } from "@/i18n/navigation";
import { SectionReveal } from "@/components/fx/section-reveal";

const mockRows = [
  { rank: 1, name: "Ashwalker", score: 18240 },
  { rank: 2, name: "VoidSeer", score: 17610 },
  { rank: 3, name: "CrimsonWolf", score: 16980 },
];

export function LandingLeaderboardPreview() {
  const t = useTranslations("landing");

  return (
    <SectionReveal className="px-6 py-24">
      <div className="mx-auto max-w-6xl">
        <h2 className="text-3xl font-semibold">{t("leaderboard.title")}</h2>
        <ul className="mt-8 space-y-3">
          {mockRows.map((r) => (
            <li
              key={r.rank}
              className="flex items-center justify-between rounded-lg border border-border/50 bg-card/40 px-5 py-4 backdrop-blur"
            >
              <span className="flex items-center gap-4">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/20 font-bold text-primary">
                  {r.rank}
                </span>
                {r.name}
              </span>
              <span className="tabular-nums text-muted-foreground">{r.score.toLocaleString()}</span>
            </li>
          ))}
        </ul>
        <Button asChild variant="outline" className="mt-8">
          <Link href="/leaderboard">{t("leaderboard.cta")}</Link>
        </Button>
      </div>
    </SectionReveal>
  );
}
