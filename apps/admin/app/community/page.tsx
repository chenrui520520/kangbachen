"use client";

import { useEffect, useState } from "react";
import { adminApi } from "@/lib/admin-api";
import { Button, Input, Label, Card, CardContent, CardHeader, CardTitle, toast } from "@kenba/ui";
import { BodyTextField } from "@/components/body-text-field";
import { ImageUploadField } from "@/components/image-upload-field";
import { resolveMediaUrl } from "@/lib/media-url";
import { zh } from "@/lib/zh";

export default function AdminCommunityPage() {
  const [data, setData] = useState<{
    roles: Array<{ key: string; name: string }>;
    inviteTiers: Array<{ key: string; name: string; minReferrals: number }>;
    badges: Array<{ id: string; key: string; name: string; rarity: string; imageUrl?: string }>;
  } | null>(null);
  const [badgeForm, setBadgeForm] = useState({
    id: "" as string | undefined,
    key: "",
    name: "",
    description: "",
    rarity: "rare",
    imageUrl: "",
    frameStyle: "violet",
  });

  const load = () => adminApi.community().then((d) => setData(d as typeof data));
  useEffect(() => {
    load();
  }, []);

  async function saveBadge() {
    try {
      await adminApi.saveBadge({
        ...badgeForm,
        id: badgeForm.id || undefined,
      });
      toast.success("徽章已保存");
      setBadgeForm({ id: undefined, key: "", name: "", description: "", rarity: "rare", imageUrl: "", frameStyle: "violet" });
      load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "保存失败");
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">{zh.nav.community}</h1>
      <p className="text-sm text-muted-foreground">徽章名称、描述与插画均可在此上传替换。</p>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>邀请等级</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {data?.inviteTiers.map((t) => (
              <p key={t.key}>
                {t.name} — 邀请 {t.minReferrals}+ 人
              </p>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>已有徽章</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {data?.badges.map((b) => (
              <button
                key={b.id}
                type="button"
                className="flex w-full items-center gap-3 rounded border border-border p-2 text-left hover:bg-muted/50"
                onClick={() =>
                  setBadgeForm({
                    id: b.id,
                    key: b.key,
                    name: b.name,
                    description: badgeForm.description,
                    rarity: b.rarity,
                    imageUrl: b.imageUrl ?? "",
                    frameStyle: badgeForm.frameStyle,
                  })
                }
              >
                {b.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={resolveMediaUrl(b.imageUrl)} alt="" className="h-10 w-10 rounded object-cover" />
                ) : null}
                <span>
                  {b.name} ({b.key}) · {b.rarity}
                </span>
              </button>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="max-w-lg space-y-3 rounded-lg border border-border p-4">
        <h2 className="font-semibold">编辑徽章</h2>
        <Label>Key</Label>
        <Input value={badgeForm.key} onChange={(e) => setBadgeForm({ ...badgeForm, key: e.target.value })} />
        <Label>名称</Label>
        <Input value={badgeForm.name} onChange={(e) => setBadgeForm({ ...badgeForm, name: e.target.value })} />
        <BodyTextField
          label="描述"
          rows={3}
          value={badgeForm.description}
          onChange={(description) => setBadgeForm({ ...badgeForm, description })}
        />
        <ImageUploadField
          label="徽章插画"
          category="community"
          value={badgeForm.imageUrl}
          onChange={(imageUrl) => setBadgeForm({ ...badgeForm, imageUrl })}
        />
        <Label>稀有度</Label>
        <Input value={badgeForm.rarity} onChange={(e) => setBadgeForm({ ...badgeForm, rarity: e.target.value })} />
        <Button onClick={() => void saveBadge()}>保存徽章</Button>
      </div>
    </div>
  );
}
