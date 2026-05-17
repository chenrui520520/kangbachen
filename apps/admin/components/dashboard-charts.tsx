"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@kenba/ui";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export function DashboardCharts({ stats }: { stats: Record<string, unknown> }) {
  const chartData = [
    { name: "用户", value: Number(stats.totalUsers ?? 0) },
    { name: "今日签到", value: Number(stats.claimsToday ?? 0) },
    { name: "任务", value: Number(stats.tasksCompleted ?? 0) },
    { name: "商城", value: Number(stats.shopOrders ?? 0) },
    { name: "邀请", value: Number(stats.referralRelations ?? 0) },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>活动快照</CardTitle>
      </CardHeader>
      <CardContent className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
            <XAxis dataKey="name" className="text-xs" />
            <YAxis className="text-xs" />
            <Tooltip />
            <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
