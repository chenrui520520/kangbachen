"use client";

import { useEffect, useState } from "react";
import { Button, Card, CardContent, CardHeader, CardTitle, Input, Label, toast } from "@kenba/ui";
import { adminApi } from "@/lib/admin-api";
import { ImageUploadField } from "@/components/image-upload-field";
import { BodyTextField } from "@/components/body-text-field";
import { resolveMediaUrl } from "@/lib/media-url";
import { zh } from "@/lib/zh";

type NftRow = { id: string; name: string; description?: string; rarity: string; imageUrl?: string };

export default function AdminNftsPage() {
  const [rows, setRows] = useState<NftRow[]>([]);
  const [form, setForm] = useState({
    id: "" as string | undefined,
    name: "",
    description: "",
    rarity: "common",
    imageUrl: "",
  });

  const load = () => adminApi.nfts().then((r) => setRows(r as NftRow[]));
  useEffect(() => {
    load();
  }, []);

  async function save() {
    try {
      await adminApi.saveNft({ ...form, id: form.id || undefined });
      toast.success("NFT 已保存");
      setForm({ id: undefined, name: "", description: "", rarity: "common", imageUrl: "" });
      load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "保存失败");
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">{zh.nav.nfts}</h1>
      <p className="text-sm text-muted-foreground">签到、商城、活动可关联的 NFT 奖励资源。</p>
      <div className="grid gap-8 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>编辑 NFT</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Label>{zh.common.name}</Label>
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <BodyTextField label="描述" rows={2} value={form.description} onChange={(description) => setForm({ ...form, description })} />
            <Label>稀有度</Label>
            <Input value={form.rarity} onChange={(e) => setForm({ ...form, rarity: e.target.value })} />
            <ImageUploadField label="NFT 图片" category="nft" value={form.imageUrl} onChange={(imageUrl) => setForm({ ...form, imageUrl })} />
            <Button onClick={() => void save()}>保存 NFT</Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>已有 NFT</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {rows.map((n) => (
              <button
                key={n.id}
                type="button"
                className="flex w-full items-center gap-3 rounded border border-border p-2 text-left text-sm hover:bg-muted/50"
                onClick={() => setForm({ id: n.id, name: n.name, description: n.description ?? "", rarity: n.rarity, imageUrl: n.imageUrl ?? "" })}
              >
                {n.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={resolveMediaUrl(n.imageUrl)} alt="" className="h-10 w-10 rounded object-cover" />
                ) : null}
                <span>
                  {n.name} · {n.rarity}
                  <span className="block font-mono text-xs text-muted-foreground">{n.id}</span>
                </span>
              </button>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
