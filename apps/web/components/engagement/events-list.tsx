"use client";

import { motion } from "framer-motion";
import { Skeleton } from "@kangba/ui";
import { useLocale } from "next-intl";
import { useQuery } from "@tanstack/react-query";
import { eventApi } from "@/lib/api-client";
import { useAuthStore } from "@/lib/stores/auth-store";
import { EventCard } from "./event-card";
import type { EventItem, EventSummary } from "@kangba/types";

function toEventItem(e: EventSummary): EventItem {
  return {
    ...e,
    userProgress: e.userProgress ?? 0,
    userClaimed: e.userClaimed ?? false,
  };
}

export function EventsList() {
  const locale = useLocale();
  const token = useAuthStore((s) => s.accessToken);
  const { data: events, isLoading } = useQuery({
    queryKey: ["events", locale, token],
    queryFn: () => eventApi.list(locale, token),
  });

  if (isLoading) {
    return (
      <motion.div className="grid gap-4 md:grid-cols-2">
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-48 w-full" />
      </motion.div>
    );
  }

  const featured = (events ?? []).filter((e) => e.featured);
  const rest = (events ?? []).filter((e) => !e.featured);

  return (
    <div className="space-y-8">
      {featured.length > 0 && (
        <section className="grid gap-4 md:grid-cols-2">
          {featured.map((event) => (
            <EventCard key={event.id} event={toEventItem(event)} />
          ))}
        </section>
      )}
      <section className="grid gap-4 md:grid-cols-2">
        {rest.map((event) => (
          <EventCard key={event.id} event={toEventItem(event)} />
        ))}
      </section>
    </div>
  );
}
