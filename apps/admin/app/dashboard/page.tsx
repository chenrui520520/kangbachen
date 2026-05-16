import { Card, CardContent, CardHeader, CardTitle } from "@kangba/ui";
import { adminApi } from "@/lib/admin-api";
import { DashboardCharts } from "@/components/dashboard-charts";

export default async function DashboardPage() {
  let stats: Record<string, unknown> = {};
  try {
    stats = await adminApi.stats();
  } catch {
    stats = { error: "请配置 NEXT_PUBLIC_ADMIN_API_KEY 并确保 API 服务已启动。" };
  }

  const metrics = [
    { label: "用户总数", key: "totalUsers" },
    { label: "今日签到", key: "claimsToday" },
    { label: "已完成任务", key: "tasksCompleted" },
    { label: "商城订单", key: "shopOrders" },
    { label: "邀请关系", key: "referralRelations" },
    { label: "未结算积分", key: "totalPointsOutstanding" },
  ] as const;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold">仪表盘</h1>
        <p className="mt-2 text-muted-foreground">平台核心指标与活动概览。</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {metrics.map((m) => (
          <Card key={m.key}>
            <CardHeader>
              <CardTitle className="text-sm text-muted-foreground">{m.label}</CardTitle>
            </CardHeader>
            <CardContent className="text-2xl font-semibold tabular-nums">
              {String(stats[m.key] ?? "—")}
            </CardContent>
          </Card>
        ))}
      </div>

      <DashboardCharts stats={stats} />
    </div>
  );
}
