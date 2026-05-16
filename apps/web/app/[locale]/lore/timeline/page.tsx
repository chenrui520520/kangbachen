import { loreApi } from "@/lib/api-client";
import { LoreAtmosphere } from "@/components/lore/lore-atmosphere";
import { TimelineExplorer, type TimelineEvent } from "@/components/lore/timeline-explorer";
import { getTranslations } from "next-intl/server";

type Props = { params: Promise<{ locale: string }> };

export default async function TimelinePage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations("lore");
  const raw = await loreApi.timeline(locale).catch(() => []);
  const events = raw.map((e) => ({
    id: String(e.id),
    slug: String(e.slug),
    title: String(e.title),
    body: String(e.body),
    era: e.era ? String(e.era) : null,
    yearLabel: e.yearLabel ? String(e.yearLabel) : null,
    sortOrder: Number(e.sortOrder ?? 0),
    faction: e.faction as TimelineEvent["faction"],
  }));

  return (
    <LoreAtmosphere>
      <div className="mx-auto max-w-5xl px-6 py-12">
        <h1 className="text-3xl font-bold">{t("timeline")}</h1>
        <p className="mt-2 text-muted-foreground">{t("timelineSubtitle")}</p>
        <div className="mt-10">
          <TimelineExplorer events={events} />
        </div>
      </div>
    </LoreAtmosphere>
  );
}
