import { EventsAdmin } from "./events-admin";
import { zh } from "@/lib/zh";

export default function AdminEventsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">{zh.nav.events}</h1>
      <p className="text-sm text-muted-foreground">管理限时活动、任务与里程碑奖励。</p>
      <EventsAdmin />
    </div>
  );
}
