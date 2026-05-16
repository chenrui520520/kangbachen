"use client";

import { useCallback, useRef, useState } from "react";
import { Button, Input, Label, toast } from "@kangba/ui";
import { adminApi, type MediaCategory } from "@/lib/admin-api";
import { resolveMediaUrl } from "@/lib/media-url";
import { ImageIcon, Loader2, Upload, X } from "lucide-react";
import { getImageUploadHint, zh } from "@/lib/zh";

type Props = {
  label?: string;
  value: string;
  onChange: (url: string) => void;
  category?: MediaCategory;
  hint?: string;
};

export function ImageUploadField({ label = "插画 / 图片", value, onChange, category = "illustrations", hint }: Props) {
  const specHint = hint ?? getImageUploadHint(category);
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const preview = resolveMediaUrl(value);

  const uploadFile = useCallback(
    async (file: File) => {
      if (!file.type.startsWith("image/")) {
        toast.error("请选择图片文件");
        return;
      }
      setUploading(true);
      try {
        const asset = await adminApi.uploadMedia(file, category);
        onChange(asset.url);
        toast.success("图片已上传");
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "上传失败");
      } finally {
        setUploading(false);
      }
    },
    [category, onChange],
  );

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) void uploadFile(file);
    },
    [uploadFile],
  );

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <p className="text-xs text-muted-foreground">
        <span className="font-medium text-foreground/80">{zh.imageUpload.specsTitle}：</span>
        {specHint}
      </p>

      <div
        className={`relative flex min-h-[140px] flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-4 transition-colors ${
          dragOver ? "border-primary bg-primary/5" : "border-border bg-muted/20"
        }`}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
      >
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview} alt="" className="max-h-32 max-w-full rounded-md object-contain shadow-sm" />
        ) : (
          <ImageIcon className="h-10 w-10 text-muted-foreground/50" aria-hidden />
        )}
        <div className="flex flex-wrap items-center justify-center gap-2">
          <Button type="button" size="sm" variant="secondary" disabled={uploading} onClick={() => inputRef.current?.click()}>
            {uploading ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : <Upload className="mr-1 h-4 w-4" />}
            {uploading ? "上传中…" : preview ? "替换图片" : "上传图片"}
          </Button>
          {value ? (
            <Button type="button" size="sm" variant="ghost" onClick={() => onChange("")}>
              <X className="mr-1 h-4 w-4" />
              清除
            </Button>
          ) : null}
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) void uploadFile(file);
            e.target.value = "";
          }}
        />
      </div>

      <div>
        <Label className="text-xs text-muted-foreground">{zh.imageUpload.pasteUrl}</Label>
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={zh.imageUpload.placeholder}
          className="mt-1 font-mono text-xs"
        />
      </div>
    </div>
  );
}
