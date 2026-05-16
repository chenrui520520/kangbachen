"use client";

import { useEffect, useState } from "react";
import { Badge, Card, CardContent, CardHeader, CardTitle } from "@kangba/ui";
import { adminApi } from "@/lib/admin-api";

export default function AdminSystemPage() {
  const [status, setStatus] = useState<Record<string, unknown> | null>(null);

  useEffect(() => {
    void adminApi.systemStatus().then(setStatus);
  }, []);

  const healthy = status?.status === "healthy";

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">系统状态</h1>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>健康检查</CardTitle>
          <Badge variant={healthy ? "default" : "destructive"}>
            {healthy ? "正常" : String(status?.status ?? "未知")}
          </Badge>
        </CardHeader>
        <CardContent className="grid gap-2 text-sm md:grid-cols-2">
          <p>数据库：{status?.database ? "正常" : "异常"}</p>
          <p>Redis：{status?.redis ? "正常" : "异常"}</p>
          <p>运行时长：{String(status?.uptimeSec ?? 0)} 秒</p>
          <p>Node 版本：{String(status?.nodeVersion ?? "")}</p>
        </CardContent>
      </Card>
    </div>
  );
}
