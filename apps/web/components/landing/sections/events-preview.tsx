"use client";

import { useTranslations } from "next-intl";
import { Button } from "@kenba/ui";
import { Link } from "@/i18n/navigation";
import { SectionReveal } from "@/components/fx/section-reveal";
import { GlowCard } from "@/components/fx/glow-card";

export function LandingEventsPreview() {
  const t = useTranslations("landing");

  return (
    <SectionReveal className="bg-gradient-to-r from-violet-950/30 via-transparent to-red-950/20 px-6 py-24">
      <div className="mx-auto flex max-w-6xl flex-col gap-10 md:flex-row md:items-center">
        <div className="flex-1">
          <p className="text-xs uppercase tracking-[0.35em] text-primary">{t("events.eyebrow")}</p>
          <h2 className="mt-4 text-3xl font-semibold md:text-4xl">{t("events.title")}</h2>
          <p className="mt-4 text-muted-foreground">{t("events.body")}</p>
          <Button asChild className="mt-6 shadow-[0_0_24px_-8px_hsl(var(--primary)/0.6)]">
            <Link href="/campaigns">{t("events.cta")}</Link>
          </Button>
        </div>
        <GlowCard className="flex-1">
          <p className="text-sm text-primary">{t("events.featured")}</p>
          <p className="mt-2 text-2xl font-semibold">{t("events.eventName")}</p>
          <p className="mt-2 text-muted-foreground">{t("events.multiplier")}</p>
        </GlowCard>
      </div>
    </SectionReveal>
  );
}
