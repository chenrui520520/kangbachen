"use client";

import { useTranslations } from "next-intl";
import { SectionReveal } from "@/components/fx/section-reveal";
import { GlowCard } from "@/components/fx/glow-card";

const rarities = ["common", "rare", "epic", "legendary"] as const;

export function LandingCreatures() {
  const t = useTranslations("landing");

  return (
    <SectionReveal className="px-6 py-24">
      <div className="mx-auto max-w-6xl">
        <p className="text-xs uppercase tracking-[0.35em] text-primary">{t("creatures.eyebrow")}</p>
        <h2 className="mt-4 text-3xl font-semibold md:text-5xl">{t("creatures.title")}</h2>
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {rarities.map((r) => (
            <GlowCard key={r} className="text-center">
              <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-primary/30 to-red-900/40 text-3xl">
                ✦
              </div>
              <p className="capitalize text-primary">{r}</p>
              <p className="mt-2 text-xs text-muted-foreground">{t(`creatures.${r}`)}</p>
            </GlowCard>
          ))}
        </div>
      </div>
    </SectionReveal>
  );
}
