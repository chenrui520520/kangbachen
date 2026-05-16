"use client";

import { useEffect, useState } from "react";
import { adminApi } from "@/lib/admin-api";
import { Button, Input, Label, toast } from "@kangba/ui";
import { BodyTextField } from "@/components/body-text-field";
import { ImageUploadField } from "@/components/image-upload-field";
import { resolveMediaUrl } from "@/lib/media-url";
import { zh } from "@/lib/zh";

type Tab = "factions" | "characters";

export default function LoreAdminPage() {
  const [tab, setTab] = useState<Tab>("factions");
  const [factions, setFactions] = useState<Array<Record<string, unknown>>>([]);
  const [characters, setCharacters] = useState<Array<Record<string, unknown>>>([]);

  const [factionForm, setFactionForm] = useState({
    id: "" as string | undefined,
    slug: "",
    locale: "en",
    name: "",
    tagline: "",
    body: "",
    imageUrl: "",
    published: true,
    colorTheme: "violet",
  });

  const [characterForm, setCharacterForm] = useState({
    id: "" as string | undefined,
    slug: "",
    locale: "en",
    name: "",
    title: "",
    body: "",
    imageUrl: "",
    rarity: "common",
    published: true,
    factionId: "" as string | null,
  });

  const load = () => {
    void adminApi.loreFactions().then((rows) => setFactions(rows as Array<Record<string, unknown>>));
    void adminApi.loreCharacters().then((rows) => setCharacters(rows as Array<Record<string, unknown>>));
  };

  useEffect(() => {
    load();
  }, []);

  async function saveFaction() {
    try {
      await adminApi.saveLoreFaction({
        ...factionForm,
        id: factionForm.id || undefined,
        body: factionForm.body || factionForm.name,
      });
      toast.success("阵营已保存");
      setFactionForm({
        id: undefined,
        slug: "",
        locale: "en",
        name: "",
        tagline: "",
        body: "",
        imageUrl: "",
        published: true,
        colorTheme: "violet",
      });
      load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "保存失败");
    }
  }

  async function saveCharacter() {
    try {
      await adminApi.saveLoreCharacter({
        ...characterForm,
        id: characterForm.id || undefined,
        body: characterForm.body || characterForm.name,
        factionId: characterForm.factionId || null,
      });
      toast.success("角色已保存");
      setCharacterForm({
        id: undefined,
        slug: "",
        locale: "en",
        name: "",
        title: "",
        body: "",
        imageUrl: "",
        rarity: "common",
        published: true,
        factionId: null,
      });
      load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "保存失败");
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">{zh.nav.lore}</h1>
      <p className="text-sm text-muted-foreground">编辑阵营/角色文案，上传或替换角色插画。</p>

      <div className="flex gap-2">
        <Button variant={tab === "factions" ? "secondary" : "outline"} size="sm" onClick={() => setTab("factions")}>
          阵营
        </Button>
        <Button variant={tab === "characters" ? "secondary" : "outline"} size="sm" onClick={() => setTab("characters")}>
          角色
        </Button>
      </div>

      {tab === "factions" && (
        <div className="grid gap-8 lg:grid-cols-2">
          <div className="space-y-3 rounded-lg border border-border p-4">
            <Label>{zh.common.locale}</Label>
            <Input value={factionForm.locale} onChange={(e) => setFactionForm({ ...factionForm, locale: e.target.value })} />
            <Label>{zh.common.slug}</Label>
            <Input value={factionForm.slug} onChange={(e) => setFactionForm({ ...factionForm, slug: e.target.value })} />
            <Label>名称</Label>
            <Input value={factionForm.name} onChange={(e) => setFactionForm({ ...factionForm, name: e.target.value })} />
            <Label>标语</Label>
            <Input value={factionForm.tagline} onChange={(e) => setFactionForm({ ...factionForm, tagline: e.target.value })} />
            <ImageUploadField
              label="阵营徽记 / 插画"
              category="lore"
              value={factionForm.imageUrl}
              onChange={(imageUrl) => setFactionForm({ ...factionForm, imageUrl })}
            />
            <BodyTextField value={factionForm.body} onChange={(body) => setFactionForm({ ...factionForm, body })} />
            <Button onClick={() => void saveFaction()}>保存阵营</Button>
          </div>
          <div>
            <h2 className="font-medium">已有阵营</h2>
            <ul className="mt-4 space-y-2 text-sm">
              {factions.map((f) => (
                <li key={String(f.id)} className="flex gap-3 rounded border border-border px-3 py-2">
                  {f.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={resolveMediaUrl(String(f.imageUrl))} alt="" className="h-12 w-12 rounded object-cover" />
                  ) : null}
                  <button
                    type="button"
                    className="flex-1 text-left"
                    onClick={() =>
                      setFactionForm({
                        id: String(f.id),
                        slug: String(f.slug),
                        locale: String(f.locale),
                        name: String(f.name),
                        tagline: String(f.tagline ?? ""),
                        body: String(f.body ?? ""),
                        imageUrl: String(f.imageUrl ?? ""),
                        published: Boolean(f.published),
                        colorTheme: String(f.colorTheme ?? "violet"),
                      })
                    }
                  >
                    {String(f.name)}（{String(f.locale)}）— {f.published ? "已发布" : "草稿"}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {tab === "characters" && (
        <div className="grid gap-8 lg:grid-cols-2">
          <div className="space-y-3 rounded-lg border border-border p-4">
            <Label>{zh.common.locale}</Label>
            <Input value={characterForm.locale} onChange={(e) => setCharacterForm({ ...characterForm, locale: e.target.value })} />
            <Label>{zh.common.slug}</Label>
            <Input value={characterForm.slug} onChange={(e) => setCharacterForm({ ...characterForm, slug: e.target.value })} />
            <Label>名称</Label>
            <Input value={characterForm.name} onChange={(e) => setCharacterForm({ ...characterForm, name: e.target.value })} />
            <Label>称号</Label>
            <Input value={characterForm.title} onChange={(e) => setCharacterForm({ ...characterForm, title: e.target.value })} />
            <Label>稀有度</Label>
            <Input value={characterForm.rarity} onChange={(e) => setCharacterForm({ ...characterForm, rarity: e.target.value })} />
            <ImageUploadField
              label="角色立绘"
              category="lore"
              value={characterForm.imageUrl}
              onChange={(imageUrl) => setCharacterForm({ ...characterForm, imageUrl })}
            />
            <BodyTextField value={characterForm.body} onChange={(body) => setCharacterForm({ ...characterForm, body })} />
            <Button onClick={() => void saveCharacter()}>保存角色</Button>
          </div>
          <div>
            <h2 className="font-medium">已有角色</h2>
            <ul className="mt-4 space-y-2 text-sm">
              {characters.map((c) => (
                <li key={String(c.id)} className="flex gap-3 rounded border border-border px-3 py-2">
                  {c.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={resolveMediaUrl(String(c.imageUrl))} alt="" className="h-12 w-12 rounded object-cover" />
                  ) : null}
                  <button
                    type="button"
                    className="flex-1 text-left"
                    onClick={() =>
                      setCharacterForm({
                        id: String(c.id),
                        slug: String(c.slug),
                        locale: String(c.locale),
                        name: String(c.name),
                        title: String(c.title ?? ""),
                        body: String(c.body ?? ""),
                        imageUrl: String(c.imageUrl ?? ""),
                        rarity: String(c.rarity ?? "common"),
                        published: Boolean(c.published),
                        factionId: c.factionId ? String(c.factionId) : null,
                      })
                    }
                  >
                    {String(c.name)} — {String(c.rarity)}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
