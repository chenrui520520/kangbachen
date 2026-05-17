"use client";

import { Skeleton } from "@kenba/ui";
import { useTasks } from "@/hooks/use-engagement";
import { TaskCard } from "./task-card";

export function TasksContent() {
  const { data: tasks, isLoading } = useTasks();

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-48 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {(tasks ?? []).map((task) => (
        <TaskCard key={task.id} task={task} />
      ))}
    </div>
  );
}
