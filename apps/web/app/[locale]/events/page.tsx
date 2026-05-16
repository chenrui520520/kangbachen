import { getTranslations } from "next-intl/server";
import { EventsList } from "@/components/engagement/events-list";

export default async function EventsPage() {
  const t = await getTranslations("engagement");

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-6 py-10">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">{t("eventsTitle")}</h1>
        <p className="mt-2 text-muted-foreground">{t("eventsSubtitle")}</p>
      </div>
      <EventsList />
    </div>
  );
}
