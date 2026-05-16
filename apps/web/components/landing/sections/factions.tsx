"use client";

import { useTranslations } from "next-intl";
import { SectionReveal } from "@/components/fx/section-reveal";
import { GlowCard } from "@/components/fx/glow-card";
import { Link } from "@/i18n/navigation";

const keys = [
  { key: "necropolis", slug: "necropolis-dominion", theme: "from-stone-500 to-zinc-800" },
  { key: "choir", slug: "choir-hollow-king", theme: "from-violet-600 to-indigo-950" },
  { key: "blackveil", slug: "blackveil-covenant", theme: "from-red-900 to-black" },
] as const;

export function LandingFactions() {
  const t = useTranslations("landing");

  return (
    <SectionReveal className="bg-gradient-to-b from-transparent via-primary/5 to-transparent px-6 py-24">
      <div className="mx-auto max-w-6xl text-center">
        <p className="text-xs uppercase tracking-[0.35em] text-primary">{t("factions.eyebrow")}</p>
        <h2 className="mt-4 text-3xl font-semibold md:text-5xl">{t("factions.title")}</h2>
        <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">{t("factions.subtitle")}</p>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {keys.map((f) => (
            <Link key={f.key} href={`/lore/factions/${f.slug}`}>
              <GlowCard className="h-full text-left transition hover:border-primary/50">
                <div className={`mb-4 h-2 w-12 rounded-full bg-gradient-to-r ${f.theme}`} />
                <h3 className="text-xl font-semibold">{t(`factions.${f.key}.name`)}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{t(`factions.${f.key}.desc`)}</p>
                <p className="mt-4 text-xs text-violet-400">{t("factions.enter")} →</p>
              </GlowCard>
            </Link>
          ))}
        </div>
      </div>
    </SectionReveal>
  );
}
