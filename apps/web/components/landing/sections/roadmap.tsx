"use client";

import { useTranslations } from "next-intl";
import { SectionReveal } from "@/components/fx/section-reveal";

const phases = ["p1", "p2", "p3", "p4"] as const;

export function LandingRoadmap() {
  const t = useTranslations("landing");

  return (
    <SectionReveal className="border-t border-border/30 px-6 py-24">
      <div className="mx-auto max-w-6xl">
        <h2 className="text-3xl font-semibold md:text-5xl">{t("roadmap.title")}</h2>
        <div className="mt-12 space-y-8 border-l border-primary/30 pl-8">
          {phases.map((p) => (
            <div key={p} className="relative">
              <span className="absolute -left-[41px] top-1 h-3 w-3 rounded-full bg-primary shadow-[0_0_12px_hsl(var(--primary))]" />
              <h3 className="font-semibold text-primary">{t(`roadmap.${p}.phase`)}</h3>
              <p className="mt-1 text-muted-foreground">{t(`roadmap.${p}.body`)}</p>
            </div>
          ))}
        </div>
      </div>
    </SectionReveal>
  );
}
