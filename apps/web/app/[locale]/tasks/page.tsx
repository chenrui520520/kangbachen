import { getTranslations } from "next-intl/server";
import { AuthGate } from "@/components/engagement/auth-gate";
import { TasksContent } from "@/components/engagement/tasks-content";

export default async function TasksPage() {
  const t = await getTranslations("engagement");

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-6 py-10">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">{t("tasksTitle")}</h1>
        <p className="mt-2 text-muted-foreground">{t("tasksSubtitle")}</p>
      </div>
      <AuthGate>
        <TasksContent />
      </AuthGate>
    </div>
  );
}
