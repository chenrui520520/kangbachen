import { eventApi } from "@/lib/api-client";
import { EventDetail } from "@/components/events/event-detail";
import { notFound } from "next/navigation";

type Props = { params: Promise<{ locale: string; slug: string }> };

export default async function EventPage({ params }: Props) {
  const { locale, slug } = await params;
  const data = await eventApi.get(slug, locale).catch(() => null);
  if (!data?.event) notFound();
  return (
    <EventDetail
      event={data.event}
      progress={data.progress}
      milestone={data.milestone}
      slug={slug}
      locale={locale}
    />
  );
}
