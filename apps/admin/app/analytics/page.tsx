"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@kenba/ui";
import { adminApi } from "@/lib/admin-api";
import { AnalyticsCharts } from "@/components/analytics-charts";

export default function AdminAnalyticsPage() {
  const [data, setData] = useState<unknown>(null);

  useEffect(() => {
    void adminApi.analytics(14).then(setData);
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">数据分析</h1>
      <p className="text-sm text-muted-foreground">本地优先的隐私安全统计，不依赖第三方追踪。</p>
      {data ? <AnalyticsCharts data={data as Parameters<typeof AnalyticsCharts>[0]["data"]} /> : <p className="text-sm text-muted-foreground">{data === null ? "加载中…" : ""}</p>}
      <Card>
        <CardHeader>
          <CardTitle>事件明细</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          <pre className="overflow-auto text-xs">{JSON.stringify(data, null, 2)}</pre>
        </CardContent>
      </Card>
    </div>
  );
}
