"use client";

import { useEffect, useState } from "react";
import { adminApi } from "@/lib/admin-api";
import { Button, Input, Label, Card, CardContent, CardHeader, CardTitle, toast } from "@kangba/ui";
import { BodyTextField } from "@/components/body-text-field";
import { ImageUploadField } from "@/components/image-upload-field";
import { zh } from "@/lib/zh";

type EventRow = {
  id: string;
  slug: string;
  locale: string;
  name: string;
  description?: string;
  bannerUrl?: string;
  active: boolean;
  multiplier: number;
  featured?: boolean;
  tasks?: Array<{ id: string; title: string; stepOrder: number }>;
};

export function EventsAdmin() {
  const [rows, setRows] = useState<EventRow[]>([]);
  const [form, setForm] = useState({
    id: "" as string | undefined,
    slug: "hollow-king-awakening",
    locale: "en",
    name: "",
    description: "",
    bannerUrl: "",
    startsAt: new Date().toISOString().slice(0, 16),
    endsAt: new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 16),
    multiplier: 1.5,
    active: true,
    featured: false,
  });
  const [taskForm, setTaskForm] = useState({
    eventId: "",
    stepOrder: 1,
    title: "",
    description: "",
    taskKey: "",
    targetProgress: 1,
    rewardPoints: 50,
  });

  const load = () => adminApi.eventsList().then((r) => setRows(r as EventRow[]));
  useEffect(() => {
    load();
  }, []);

  async function saveEvent() {
    try {
      await adminApi.saveEvent({
        ...form,
        id: form.id || undefined,
        startsAt: new Date(form.startsAt).toISOString(),
        endsAt: new Date(form.endsAt).toISOString(),
      });
      toast.success("活动已保存");
      load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "保存失败");
    }
  }

  async function saveTask() {
    if (!taskForm.eventId) return;
    try {
      await adminApi.saveEventTask(taskForm);
      toast.success("任务已保存");
      load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "保存失败");
    }
  }

  return (
    <div className="space-y-8">
      <div className="grid gap-8 lg:grid-cols-2">
        <div className="space-y-3 rounded-lg border border-border p-4">
          <h2 className="font-semibold">活动文案与插画</h2>
          <Label>{zh.common.slug}</Label>
          <Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} />
          <Label>{zh.common.locale}</Label>
          <Input value={form.locale} onChange={(e) => setForm({ ...form, locale: e.target.value })} />
          <Label>{zh.common.name}</Label>
          <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <BodyTextField
            label="活动说明"
            rows={4}
            value={form.description}
            onChange={(description) => setForm({ ...form, description })}
          />
          <ImageUploadField
            label="活动横幅插画"
            category="events"
            value={form.bannerUrl}
            onChange={(bannerUrl) => setForm({ ...form, bannerUrl })}
          />
          <Label>奖励倍率</Label>
          <Input
            type="number"
            step="0.1"
            value={form.multiplier}
            onChange={(e) => setForm({ ...form, multiplier: Number(e.target.value) })}
          />
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label>开始时间</Label>
              <Input
                type="datetime-local"
                value={form.startsAt}
                onChange={(e) => setForm({ ...form, startsAt: e.target.value })}
              />
            </div>
            <div>
              <Label>结束时间</Label>
              <Input
                type="datetime-local"
                value={form.endsAt}
                onChange={(e) => setForm({ ...form, endsAt: e.target.value })}
              />
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.active}
              onChange={(e) => setForm({ ...form, active: e.target.checked })}
            />
            {zh.common.active}
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.featured}
              onChange={(e) => setForm({ ...form, featured: e.target.checked })}
            />
            {zh.common.featured}
          </label>
          <Button onClick={() => void saveEvent()}>保存活动</Button>
        </div>

        <div className="space-y-3 rounded-lg border border-border p-4">
          <h2 className="font-semibold">添加任务</h2>
          <Label>活动 ID</Label>
          <Input
            value={taskForm.eventId}
            onChange={(e) => setTaskForm({ ...taskForm, eventId: e.target.value })}
            placeholder="从下方列表复制"
          />
          <Label>步骤序号</Label>
          <Input
            type="number"
            value={taskForm.stepOrder}
            onChange={(e) => setTaskForm({ ...taskForm, stepOrder: Number(e.target.value) })}
          />
          <Label>{zh.common.title}</Label>
          <Input value={taskForm.title} onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })} />
          <BodyTextField
            label="任务说明"
            rows={3}
            value={taskForm.description}
            onChange={(description) => setTaskForm({ ...taskForm, description })}
          />
          <Label>任务标识 (taskKey)</Label>
          <Input
            value={taskForm.taskKey}
            onChange={(e) => setTaskForm({ ...taskForm, taskKey: e.target.value })}
          />
          <Button onClick={() => void saveTask()}>保存任务</Button>
        </div>
      </div>

      <div className="grid gap-4">
        {rows.map((e) => (
          <Card
            key={e.id}
            className="cursor-pointer transition-colors hover:border-primary/40"
            onClick={() =>
              setForm({
                id: e.id,
                slug: e.slug,
                locale: e.locale,
                name: e.name,
                description: e.description ?? "",
                bannerUrl: e.bannerUrl ?? "",
                startsAt: form.startsAt,
                endsAt: form.endsAt,
                multiplier: e.multiplier,
                active: e.active,
                featured: e.featured ?? false,
              })
            }
          >
            <CardHeader>
              <CardTitle>
                {e.name} ({e.locale})
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              {e.slug} · {e.active ? "进行中" : "已停用"} · {e.multiplier}× · {e.tasks?.length ?? 0} 个任务
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}