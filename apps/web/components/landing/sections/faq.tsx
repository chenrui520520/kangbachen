"use client";

import { useTranslations } from "next-intl";
import { SectionReveal } from "@/components/fx/section-reveal";

const items = ["q1", "q2", "q3", "q4"] as const;

export function LandingFaq() {
  const t = useTranslations("landing");

  return (
    <SectionReveal className="px-6 py-24">
      <div className="mx-auto max-w-3xl">
        <h2 className="text-center text-3xl font-semibold">{t("faq.title")}</h2>
        <div className="mt-10 space-y-3">
          {items.map((id) => (
            <details
              key={id}
              className="group rounded-lg border border-border/50 bg-card/30 px-5 py-4 backdrop-blur open:border-primary/30"
            >
              <summary className="cursor-pointer list-none font-medium marker:content-none [&::-webkit-details-marker]:hidden">
                {t(`faq.${id}.q`)}
              </summary>
              <p className="mt-3 text-sm text-muted-foreground">{t(`faq.${id}.a`)}</p>
            </details>
          ))}
        </div>
      </div>
    </SectionReveal>
  );
}
