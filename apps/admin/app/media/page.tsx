"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Button, Card, CardContent, CardHeader, CardTitle, Label, toast } from "@kangba/ui";
import { adminApi, type MediaAsset, type MediaCategory } from "@/lib/admin-api";
import { resolveMediaUrl } from "@/lib/media-url";
import { Copy, Loader2, Upload } from "lucide-react";
import { getImageUploadHint, mediaCategoryOptions, zh } from "@/lib/zh";

export default function AdminMediaPage() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [category, setCategory] = useState<MediaCategory>("illustrations");
  const [assets, setAssets] = useState<MediaAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    adminApi
      .listMedia(category)
      .then(setAssets)
      .catch((e) => toast.error(e instanceof Error ? e.message : "加载失败"))
      .finally(() => setLoading(false));
  }, [category]);

  useEffect(() => {
    load();
  }, [load]);

  async function onUpload(file: File) {
    setUploading(true);
    try {
      await adminApi.uploadMedia(file, category);
      toast.success("已上传");
      load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "上传失败");
    } finally {
      setUploading(false);
    }
  }

  function copyUrl(url: string) {
    void navigator.clipboard.writeText(url);
    toast.success("URL 已复制");
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">{zh.nav.media}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          上传图片至本地 storage，各模块可引用 /storage/images/… 路径。
        </p>
        <p className="mt-2 text-xs text-muted-foreground">
          <span className="font-medium text-foreground/80">{zh.imageUpload.specsTitle}：</span>
          {getImageUploadHint(category)}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>上传</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap items-end gap-4">
          <div>
            <Label>分类目录</Label>
            <select
              className="mt-1 block w-full min-w-[180px] rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={category}
              onChange={(e) => setCategory(e.target.value as MediaCategory)}
            >
              {mediaCategoryOptions.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>
          <Button type="button" disabled={uploading} onClick={() => inputRef.current?.click()}>
            {uploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
            选择图片上传
          </Button>
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void onUpload(file);
              e.target.value = "";
            }}
          />
        </CardContent>
      </Card>

      {loading ? (
        <p className="text-sm text-muted-foreground">加载中…</p>
      ) : assets.length === 0 ? (
        <p className="text-sm text-muted-foreground">该分类暂无图片，请先上传。</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {assets.map((a) => (
            <Card key={a.url} className="overflow-hidden">
              <div className="aspect-video bg-muted/30 p-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={resolveMediaUrl(a.url)} alt={a.name} className="h-full w-full object-contain" />
              </div>
              <CardContent className="space-y-2 p-3">
                <p className="truncate font-mono text-xs">{a.name}</p>
                <p className="text-xs text-muted-foreground">{(a.size / 1024).toFixed(1)} KB</p>
                <Button type="button" size="sm" variant="outline" className="w-full" onClick={() => copyUrl(a.url)}>
                  <Copy className="mr-1 h-3 w-3" />
                  复制路径
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
