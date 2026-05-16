"use client";

import { useTranslations } from "next-intl";
import { SectionReveal } from "@/components/fx/section-reveal";

const steps = ["signin", "tasks", "events", "rewards"] as const;

export function LandingGameplay() {
  const t = useTranslations("landing");

  return (
    <SectionReveal className="px-6 py-24">
      <div className="mx-auto max-w-6xl">
        <h2 className="text-3xl font-semibold md:text-5xl">{t("gameplay.title")}</h2>
        <ol className="mt-12 grid gap-8 md:grid-cols-4">
          {steps.map((s, i) => (
            <li key={s} className="relative rounded-xl border border-border/40 bg-card/30 p-6 backdrop-blur">
              <span className="text-4xl font-bold text-primary/40">{String(i + 1).padStart(2, "0")}</span>
              <h3 className="mt-4 font-semibold">{t(`gameplay.${s}.title`)}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{t(`gameplay.${s}.body`)}</p>
            </li>
          ))}
        </ol>
      </div>
    </SectionReveal>
  );
}
