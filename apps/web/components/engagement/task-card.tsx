"use client";

import type { TaskItem } from "@kenba/types";
import { Badge, Button, Card, CardContent, CardHeader, CardTitle, toast } from "@kenba/ui";
import { useTranslations } from "next-intl";
import { useCompleteTask } from "@/hooks/use-engagement";
import { ApiClientError } from "@/lib/api-client";

export function TaskCard({ task }: { task: TaskItem }) {
  const t = useTranslations("engagement");
  const complete = useCompleteTask();
  const progressPct = Math.min(100, Math.round((task.progress / task.targetProgress) * 100));

  async function handleClaim() {
    try {
      const res = await complete.mutateAsync(task.id);
      toast.success(t("taskClaimed", { points: res.rewardPoints }));
    } catch (err) {
      toast.error(err instanceof ApiClientError ? err.message : t("taskFailed"));
    }
  }

  return (
    <Card className="border-border/60 bg-card/70 backdrop-blur-md">
      <CardHeader className="flex flex-row items-start justify-between gap-2">
        <div>
          <Badge variant="outline" className="mb-2 text-[10px] uppercase">
            {task.category}
          </Badge>
          <CardTitle className="text-lg">{task.name}</CardTitle>
        </div>
        <Badge variant="secondary">+{task.rewardPoints}</Badge>
      </CardHeader>
      <CardContent className="space-y-4">
        {task.description && <p className="text-sm text-muted-foreground">{task.description}</p>}
        <div>
          <div className="mb-1 flex justify-between text-xs text-muted-foreground">
            <span>{t("progress")}</span>
            <span>
              {task.progress}/{task.targetProgress}
            </span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-all duration-500"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>
        <Button
          size="sm"
          className="w-full"
          disabled={!task.canClaim || complete.isPending}
          onClick={() => void handleClaim()}
        >
          {task.onCooldown
            ? t("onCooldown")
            : task.completed && !task.repeatable
              ? t("completed")
              : t("claimReward")}
        </Button>
      </CardContent>
    </Card>
  );
}
