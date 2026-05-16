import type { ReactNode } from "react";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { SiteHeader } from "@/components/site-header";
import { AppProviders } from "@/components/providers/app-providers";
import { AnnouncementBar } from "@/components/cms/announcement-bar";
import { StructuredData } from "@/components/seo/structured-data";

type Props = {
  children: ReactNode;
  params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;
  if (!routing.locales.includes(locale as (typeof routing.locales)[number])) {
    notFound();
  }

  setRequestLocale(locale);
  const messages = await getMessages();
  const t = await getTranslations("nav");
  const dir = locale === "ar" ? "rtl" : "ltr";

  const navLabels = {
    home: t("home"),
    lore: t("lore"),
    campaigns: t("campaigns"),
    tasks: t("tasks"),
    rewards: t("rewards"),
    leaderboard: t("leaderboard"),
    events: t("events"),
    shop: t("shop"),
    litepaper: t("litepaper"),
    invite: t("invite"),
  };

  return (
    <NextIntlClientProvider messages={messages}>
      <AppProviders>
        <div dir={dir} className="min-h-dvh">
          <StructuredData />
          <AnnouncementBar />
          <SiteHeader labels={navLabels} />
          {children}
        </div>
      </AppProviders>
    </NextIntlClientProvider>
  );
}
