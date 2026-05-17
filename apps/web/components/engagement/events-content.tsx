"use client";

import { Skeleton } from "@kenba/ui";
import { useEvents } from "@/hooks/use-engagement";
import { EventCard } from "./event-card";

export function EventsContent() {
  const { data: events, isLoading } = useEvents();

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2">
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  const featured = (events ?? []).filter((e) => e.featured);
  const rest = (events ?? []).filter((e) => !e.featured);

  return (
    <div className="space-y-8">
      {featured.length > 0 && (
        <section className="grid gap-4 md:grid-cols-2">
          {featured.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </section>
      )}
      <section className="grid gap-4 md:grid-cols-2">
        {rest.map((event) => (
          <EventCard key={event.id} event={event} />
        ))}
      </section>
    </div>
  );
}
