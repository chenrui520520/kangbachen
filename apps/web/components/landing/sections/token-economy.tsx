"use client";

import { useTranslations } from "next-intl";
import { Badge } from "@kenba/ui";
import { SectionReveal } from "@/components/fx/section-reveal";
import { GlowCard } from "@/components/fx/glow-card";

export function LandingTokenEconomy() {
  const t = useTranslations("landing");

  return (
    <SectionReveal className="border-y border-border/30 bg-black/30 px-6 py-24">
      <div className="mx-auto max-w-6xl">
        <Badge variant="outline" className="mb-4">
          {t("token.mockBadge")}
        </Badge>
        <h2 className="text-3xl font-semibold md:text-5xl">{t("token.title")}</h2>
        <p className="mt-4 max-w-2xl text-muted-foreground">{t("token.body")}</p>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {["earn", "spend", "airdrop"].map((k) => (
            <GlowCard key={k}>
              <h3 className="font-semibold">{t(`token.${k}.title`)}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{t(`token.${k}.body`)}</p>
            </GlowCard>
          ))}
        </div>
      </div>
    </SectionReveal>
  );
}
