"use client";

import { useEffect, useState } from "react";
import { adminApi } from "@/lib/admin-api";

export default function MonitoringPage() {
  const [data, setData] = useState<Record<string, unknown> | null>(null);

  useEffect(() => {
    adminApi.monitoring().then(setData).catch(console.error);
    const t = setInterval(() => {
      adminApi.monitoring().then(setData).catch(console.error);
    }, 10000);
    return () => clearInterval(t);
  }, []);

  const metrics = (data?.metrics as Record<string, unknown>) ?? {};

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">监控</h1>
      <p className="text-sm text-muted-foreground">本地优先的可观测性，不依赖外部 SaaS。</p>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Widget label="状态" value={String(data?.status ?? "—")} />
        <Widget label="运行时长（秒）" value={String(data?.uptimeSec ?? "—")} />
        <Widget label="平均延迟（毫秒）" value={String(metrics.avgLatencyMs ?? "—")} />
        <Widget label="认证失败次数" value={String(metrics.failedAuth ?? "—")} />
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-lg border border-border p-4">
          <h2 className="font-medium">数据库</h2>
          <pre className="mt-2 overflow-auto text-xs text-muted-foreground">
            {JSON.stringify(data?.database, null, 2)}
          </pre>
        </div>
        <div className="rounded-lg border border-border p-4">
          <h2 className="font-medium">Redis</h2>
          <pre className="mt-2 overflow-auto text-xs text-muted-foreground">
            {JSON.stringify(data?.redis, null, 2)}
          </pre>
        </div>
      </div>
      <div className="rounded-lg border border-border p-4">
        <h2 className="font-medium">最近请求</h2>
        <pre className="mt-2 max-h-64 overflow-auto text-xs text-muted-foreground">
          {JSON.stringify(metrics.recentRequests, null, 2)}
        </pre>
      </div>
    </div>
  );
}

function Widget({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-card/50 p-4">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="mt-1 text-xl font-semibold">{value}</div>
    </div>
  );
}
