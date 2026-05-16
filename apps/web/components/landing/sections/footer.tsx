"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Separator } from "@kangba/ui";

export function LandingFooter() {
  const t = useTranslations("landing");

  return (
    <footer className="border-t border-border/40 bg-black/50 px-6 py-16">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 md:flex-row md:justify-between">
        <div>
          <p className="text-sm font-semibold tracking-[0.35em]">KANGBA</p>
          <p className="mt-2 max-w-sm text-sm text-muted-foreground">{t("footer.tagline")}</p>
        </div>
        <nav className="flex flex-wrap gap-6 text-sm text-muted-foreground">
          <Link href="/tasks">{t("footer.tasks")}</Link>
          <Link href="/rewards">{t("footer.rewards")}</Link>
          <Link href="/invite">{t("footer.invite")}</Link>
          <Link href="/shop">{t("footer.shop")}</Link>
        </nav>
      </div>
      <Separator className="my-8 opacity-30" />
      <p className="text-center text-xs text-muted-foreground">{t("footer.legal")}</p>
    </footer>
  );
}
