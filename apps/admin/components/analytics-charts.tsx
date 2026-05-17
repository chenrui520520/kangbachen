"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@kenba/ui";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

type DashboardData = {
  daily?: Array<{ date: string; pageViews: number; signIns: number; dau: number }>;
};

export function AnalyticsCharts({ data }: { data: DashboardData }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>近 14 日趋势</CardTitle>
      </CardHeader>
      <CardContent className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data.daily ?? []}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
            <XAxis dataKey="date" tick={{ fontSize: 10 }} />
            <YAxis tick={{ fontSize: 10 }} />
            <Tooltip />
            <Line type="monotone" dataKey="pageViews" name="页面浏览" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="signIns" name="签到" stroke="#f87171" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="dau" name="日活" stroke="#a78bfa" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
