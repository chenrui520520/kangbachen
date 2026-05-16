"use client";

import { useState } from "react";
import { Button, Card, CardContent, CardHeader, CardTitle, toast } from "@kangba/ui";
import { adminApi } from "@/lib/admin-api";

type ExportKind = "rewards" | "points" | "referrals" | "leaderboard";

export default function AdminExportsPage() {
  const [loading, setLoading] = useState<ExportKind | null>(null);

  async function run(kind: ExportKind, format: "json" | "csv") {
    setLoading(kind);
    try {
      let result: unknown;
      if (kind === "rewards") result = await adminApi.exportRewards(format);
      else if (kind === "points") result = await adminApi.exportPoints(format);
      else if (kind === "referrals") result = await adminApi.exportReferrals(format);
      else result = await adminApi.exportLeaderboard("points", format);

      const file = (result as { file?: { filename: string } })?.file;
      toast.success(file ? `已保存至 storage/exports/${file.filename}` : "导出完成");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "导出失败");
    } finally {
      setLoading(null);
    }
  }

  const items: { kind: ExportKind; label: string }[] = [
    { kind: "rewards", label: "奖励记录" },
    { kind: "points", label: "积分流水" },
    { kind: "referrals", label: "邀请数据" },
    { kind: "leaderboard", label: "排行榜（积分）" },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">数据导出</h1>
      <p className="text-muted-foreground">生成 CSV / JSON 文件至 storage/exports，用于空投与运营。</p>
      <div className="grid gap-4 md:grid-cols-2">
        {items.map((item) => (
          <Card key={item.kind}>
            <CardHeader>
              <CardTitle>{item.label}</CardTitle>
            </CardHeader>
            <CardContent className="flex gap-2">
              <Button disabled={loading === item.kind} onClick={() => void run(item.kind, "csv")}>
                导出 CSV
              </Button>
              <Button variant="outline" disabled={loading === item.kind} onClick={() => void run(item.kind, "json")}>
                导出 JSON
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
