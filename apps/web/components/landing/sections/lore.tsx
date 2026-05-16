"use client";

import { useTranslations } from "next-intl";
import { SectionReveal } from "@/components/fx/section-reveal";
import { GlowCard } from "@/components/fx/glow-card";

export function LandingLore() {
  const t = useTranslations("landing");

  return (
    <SectionReveal className="border-t border-border/30 px-6 py-24 md:py-32">
      <div className="mx-auto max-w-6xl">
        <p className="text-xs uppercase tracking-[0.35em] text-primary">{t("lore.eyebrow")}</p>
        <h2 className="mt-4 text-3xl font-semibold md:text-5xl">{t("lore.title")}</h2>
        <p className="mt-6 max-w-3xl text-lg text-muted-foreground">{t("lore.body")}</p>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <GlowCard key={i}>
              <h3 className="text-lg font-semibold">{t(`lore.cards.${i}.title`)}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{t(`lore.cards.${i}.body`)}</p>
            </GlowCard>
          ))}
        </div>
      </div>
    </SectionReveal>
  );
}
