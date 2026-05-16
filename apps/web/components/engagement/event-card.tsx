"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { EventItem } from "@kangba/types";
import { Badge, Card, CardContent, CardDescription, CardHeader, CardTitle } from "@kangba/ui";
import { useLocale, useTranslations } from "next-intl";
import { cn } from "@kangba/ui";

function formatCountdown(ms: number): string {
  if (ms <= 0) return "0:00:00";
  const s = Math.floor(ms / 1000);
  const d = Math.floor(s / 86400);
  const h = Math.floor((s % 86400) / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (d > 0) return `${d}d ${h}h`;
  return `${h}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
}

export function EventCard({ event }: { event: EventItem }) {
  const t = useTranslations("engagement");
  const locale = useLocale();
  const slug = event.slug ?? event.id;
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const starts = new Date(event.startsAt).getTime();
  const ends = new Date(event.endsAt).getTime();
  const isActive = event.status === "active" || (now >= starts && now < ends);
  const isUpcoming = now < starts;
  const countdownMs = isUpcoming ? starts - now : isActive ? ends - now : 0;

  return (
    <Card
      className={cn(
        "glow-card-crimson overflow-hidden border-border/60 bg-card/70 backdrop-blur-md",
        event.featured && "border-primary/40 shadow-[0_0_32px_-12px_hsl(var(--primary)/0.45)]",
      )}
    >
      <Link href={`/${locale}/events/${slug}`} className="block">
      <div className="h-24 bg-gradient-to-r from-primary/30 via-background to-accent/20" />
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle>{event.name}</CardTitle>
            <CardDescription>{event.description}</CardDescription>
          </div>
          <Badge variant={isActive ? "default" : isUpcoming ? "secondary" : "outline"}>
            {isActive ? t("eventActive") : isUpcoming ? t("eventUpcoming") : t("eventEnded")}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <p className="text-primary">{t("multiplier", { x: event.multiplier })}</p>
        {(isActive || isUpcoming) && (
          <p className="text-muted-foreground">
            {isUpcoming ? t("startsIn") : t("endsIn")}: {formatCountdown(countdownMs)}
          </p>
        )}
        {event.rewards.length > 0 && (
          <p className="text-xs text-muted-foreground">
            {event.rewards.length} milestone reward{event.rewards.length > 1 ? "s" : ""}
          </p>
        )}
        {event.totalTasks ? (
          <p className="text-xs text-violet-400">
            {event.tasksCompleted ?? 0}/{event.totalTasks} rites
          </p>
        ) : null}
        <p className="text-xs font-medium text-primary">{t("viewChronicle")}</p>
      </CardContent>
      </Link>
    </Card>
  );
}
