"use client";

import { useEffect, useState } from "react";
import { adminApi } from "@/lib/admin-api";
import { Button, Input, Label, toast } from "@kangba/ui";
import { BodyTextField } from "@/components/body-text-field";
import { ImageUploadField } from "@/components/image-upload-field";
import { zh } from "@/lib/zh";

type Campaign = {
  id: string;
  slug: string;
  locale: string;
  name: string;
  description?: string;
  narrative?: string;
  bannerUrl?: string;
  active: boolean;
  quests?: Array<{ id: string; title: string; stepOrder: number }>;
};

export default function AdminCampaignsPage() {
  const [rows, setRows] = useState<Campaign[]>([]);
  const [form, setForm] = useState({
    id: "" as string | undefined,
    slug: "",
    locale: "en",
    name: "",
    description: "",
    narrative: "",
    bannerUrl: "",
    startsAt: new Date().toISOString().slice(0, 16),
    endsAt: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 16),
    active: true,
    featured: false,
  });
  const [questForm, setQuestForm] = useState({
    campaignId: "",
    stepOrder: 1,
    title: "",
    description: "",
    taskKey: "",
    targetProgress: 1,
    rewardPoints: 100,
  });

  const load = () => adminApi.campaigns().then((r) => setRows(r as Campaign[]));
  useEffect(() => {
    load();
  }, []);

  async function saveQuest() {
    if (!questForm.campaignId) return;
    await adminApi.saveCampaignQuest(questForm);
    toast.success("任务已保存");
    load();
  }

  async function save() {
    try {
      await adminApi.saveCampaign({
        ...form,
        id: form.id || undefined,
        startsAt: new Date(form.startsAt).toISOString(),
        endsAt: new Date(form.endsAt).toISOString(),
      });
      toast.success("战役已保存");
      load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "保存失败");
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">{zh.nav.campaigns}</h1>
      <div className="mt-8 grid gap-8 lg:grid-cols-2">
        <div className="space-y-3 rounded-lg border border-border p-4">
          <h2 className="font-semibold">战役内容</h2>
          <Label>{zh.common.slug}</Label>
          <Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} />
          <Label>{zh.common.locale}</Label>
          <Input value={form.locale} onChange={(e) => setForm({ ...form, locale: e.target.value })} />
          <Label>名称</Label>
          <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <BodyTextField
            label="简介"
            rows={3}
            value={form.description}
            onChange={(description) => setForm({ ...form, description })}
          />
          <BodyTextField
            label="叙事正文"
            value={form.narrative}
            onChange={(narrative) => setForm({ ...form, narrative })}
          />
          <ImageUploadField
            label="战役横幅插画"
            category="campaigns"
            value={form.bannerUrl}
            onChange={(bannerUrl) => setForm({ ...form, bannerUrl })}
          />
          <Button onClick={() => void save()}>保存战役</Button>
        </div>
        <div className="space-y-3 rounded-lg border border-border p-4">
          <h2 className="font-semibold">任务</h2>
          <Label>战役 ID</Label>
          <Input value={questForm.campaignId} onChange={(e) => setQuestForm({ ...questForm, campaignId: e.target.value })} />
          <Label>标题</Label>
          <Input value={questForm.title} onChange={(e) => setQuestForm({ ...questForm, title: e.target.value })} />
          <BodyTextField
            label="任务说明"
            rows={3}
            value={questForm.description}
            onChange={(description) => setQuestForm({ ...questForm, description })}
          />
          <Label>任务标识 (taskKey)</Label>
          <Input value={questForm.taskKey} onChange={(e) => setQuestForm({ ...questForm, taskKey: e.target.value })} />
          <Button onClick={() => void saveQuest()}>保存任务</Button>
        </div>
        <ul className="space-y-2 text-sm lg:col-span-2">
          {rows.map((c) => (
            <li key={c.id} className="rounded border border-border p-3">
              <button
                type="button"
                className="w-full text-left"
                onClick={() =>
                  setForm({
                    id: c.id,
                    slug: c.slug,
                    locale: c.locale,
                    name: c.name,
                    description: c.description ?? "",
                    narrative: c.narrative ?? "",
                    bannerUrl: c.bannerUrl ?? "",
                    startsAt: form.startsAt,
                    endsAt: form.endsAt,
                    active: c.active,
                    featured: false,
                  })
                }
              >
                <div className="font-medium">{c.name} ({c.locale})</div>
                <div className="text-muted-foreground text-xs">{c.id}</div>
                <div className="text-xs">{c.slug} · {c.quests?.length ?? 0} 个任务</div>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
