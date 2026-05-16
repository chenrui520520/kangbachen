"use client";

import { useEffect, useState } from "react";
import { adminApi } from "@/lib/admin-api";
import { Button, Input, Label, toast } from "@kangba/ui";
import { BodyTextField } from "@/components/body-text-field";
import { zh } from "@/lib/zh";

const CATEGORIES = ["litepaper", "docs", "tokenomics", "roadmap", "faq"] as const;

type DocRow = {
  id: string;
  slug: string;
  category: string;
  locale: string;
  title: string;
  body?: string;
  published: boolean;
};

export default function AdminDocsPage() {
  const [rows, setRows] = useState<DocRow[]>([]);
  const [form, setForm] = useState({
    id: "" as string | undefined,
    slug: "overview",
    category: "litepaper" as (typeof CATEGORIES)[number],
    locale: "en",
    title: "",
    body: "",
    published: true,
    sortOrder: 0,
  });

  const load = () => adminApi.docs().then((r) => setRows(r as DocRow[]));
  useEffect(() => {
    load();
  }, []);

  async function save() {
    try {
      await adminApi.saveDoc({ ...form, id: form.id || undefined });
      toast.success("文档已保存");
      load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "保存失败");
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">{zh.nav.docs}</h1>
      <p className="text-sm text-muted-foreground">编辑文档标题与 Markdown 正文，点击列表可载入替换。</p>
      <div className="grid gap-8 lg:grid-cols-2">
        <div className="space-y-3 rounded-lg border border-border p-4">
          <Label>分类</Label>
          <select
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value as (typeof CATEGORIES)[number] })}
          >
            {(
              [
                ["litepaper", "轻皮书"],
                ["docs", "文档"],
                ["tokenomics", "代币经济"],
                ["roadmap", "路线图"],
                ["faq", "常见问题"],
              ] as const
            ).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
          <Label>{zh.common.slug}</Label>
          <Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} />
          <Label>{zh.common.locale}</Label>
          <Input value={form.locale} onChange={(e) => setForm({ ...form, locale: e.target.value })} />
          <Label>{zh.common.title}</Label>
          <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <BodyTextField value={form.body} onChange={(body) => setForm({ ...form, body })} />
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.published}
              onChange={(e) => setForm({ ...form, published: e.target.checked })}
            />
            {zh.common.published}
          </label>
          <Button onClick={() => void save()}>保存文档</Button>
        </div>
        <ul className="max-h-[70vh] space-y-1 overflow-auto text-sm">
          {rows.map((r) => (
            <li key={r.id}>
              <button
                type="button"
                className="w-full rounded border border-border px-2 py-1 text-left hover:bg-muted/50"
                onClick={() =>
                  setForm({
                    id: r.id,
                    slug: r.slug,
                    category: r.category as (typeof CATEGORIES)[number],
                    locale: r.locale,
                    title: r.title,
                    body: r.body ?? "",
                    published: r.published,
                    sortOrder: 0,
                  })
                }
              >
                [{r.locale}] {r.category}/{r.slug} — {r.title}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
