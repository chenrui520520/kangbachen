"use client";

import { useEffect, useState } from "react";
import { Button, Card, CardContent, CardHeader, CardTitle, Input, Label, toast } from "@kenba/ui";
import { adminApi } from "@/lib/admin-api";
import { BodyTextField } from "@/components/body-text-field";
import { zh } from "@/lib/zh";

type TaskRow = {
  id: string;
  name: string;
  description?: string;
  type: string;
  category: string;
  rewardPoints: number;
  active: boolean;
};

export default function AdminTasksPage() {
  const [rows, setRows] = useState<TaskRow[]>([]);
  const [form, setForm] = useState({
    id: "" as string | undefined,
    name: "",
    description: "",
    type: "daily_signin",
    category: "DAILY",
    rewardPoints: 10,
    targetProgress: 1,
    repeatable: true,
    active: true,
    rewardNftId: null as string | null,
  });

  const load = () => adminApi.tasks().then((r) => setRows(r as TaskRow[]));
  useEffect(() => {
    load();
  }, []);

  async function save() {
    try {
      await adminApi.saveTask({ ...form, id: form.id || undefined });
      toast.success("任务已保存");
      load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "保存失败");
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">{zh.nav.tasks}</h1>
      <p className="text-sm text-muted-foreground">管理前台任务列表的文案、积分奖励与启用状态。</p>
      <div className="grid gap-8 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>编辑任务</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Label>{zh.common.name}</Label>
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <BodyTextField value={form.description} onChange={(description) => setForm({ ...form, description })} rows={3} label="描述" />
            <Label>类型 (type)</Label>
            <Input value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} />
            <Label>分类</Label>
            <Input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
            <Label>奖励积分</Label>
            <Input type="number" value={form.rewardPoints} onChange={(e) => setForm({ ...form, rewardPoints: Number(e.target.value) })} />
            <Label>目标进度</Label>
            <Input type="number" value={form.targetProgress} onChange={(e) => setForm({ ...form, targetProgress: Number(e.target.value) })} />
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={form.repeatable} onChange={(e) => setForm({ ...form, repeatable: e.target.checked })} />
              可重复
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} />
              {zh.common.active}
            </label>
            <Button onClick={() => void save()}>保存任务</Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>任务列表（点击编辑）</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {rows.map((t) => (
              <button
                key={t.id}
                type="button"
                className="block w-full rounded border border-border px-3 py-2 text-left hover:bg-muted/50"
                onClick={() =>
                  setForm({
                    id: t.id,
                    name: t.name,
                    description: t.description ?? "",
                    type: t.type,
                    category: t.category,
                    rewardPoints: t.rewardPoints,
                    targetProgress: 1,
                    repeatable: true,
                    active: t.active,
                    rewardNftId: null,
                  })
                }
              >
                {t.name} · {t.rewardPoints} 分 · {t.active ? "启用" : "停用"}
              </button>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
