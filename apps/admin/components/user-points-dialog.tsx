"use client";

import { useState } from "react";
import { Button, Input, Label, toast } from "@kenba/ui";
import { adminApi } from "@/lib/admin-api";

type Props = {
  userId: string;
  email: string | null;
  currentPoints: number;
  onClose: () => void;
  onSuccess: () => void;
};

export function UserPointsDialog({ userId, email, currentPoints, onClose, onSuccess }: Props) {
  const [mode, setMode] = useState<"add" | "deduct" | "set">("add");
  const [amount, setAmount] = useState(100);
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);

  return (
    <div className="rounded-lg border border-primary/30 bg-muted/30 p-4 text-sm">
      <p className="font-medium">调整积分 — {email ?? userId.slice(0, 12)}</p>
      <p className="text-muted-foreground">当前积分：{currentPoints}</p>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <div>
          <Label>方式</Label>
          <select
            className="mt-1 w-full rounded-md border border-input bg-background px-2 py-1.5 text-sm"
            value={mode}
            onChange={(e) => setMode(e.target.value as "add" | "deduct" | "set")}
          >
            <option value="add">增加</option>
            <option value="deduct">扣减</option>
            <option value="set">设为指定值</option>
          </select>
        </div>
        <div>
          <Label>{mode === "set" ? "目标积分" : "数量"}</Label>
          <Input className="mt-1" type="number" min={0} value={amount} onChange={(e) => setAmount(Number(e.target.value))} />
        </div>
        <div className="sm:col-span-2">
          <Label>备注（可选）</Label>
          <Input className="mt-1" value={note} onChange={(e) => setNote(e.target.value)} placeholder="运营补发、活动奖励等" />
        </div>
      </div>
      <div className="mt-4 flex gap-2">
        <Button
          size="sm"
          disabled={saving}
          onClick={() => {
            setSaving(true);
            adminApi
              .adjustUserPoints({ userId, mode, amount, note: note || undefined })
              .then((r) => {
                toast.success(`已更新，当前积分 ${r.points}`);
                onSuccess();
              })
              .catch((e) => toast.error(e instanceof Error ? e.message : "调整失败"))
              .finally(() => setSaving(false));
          }}
        >
          {saving ? "提交中…" : "确认"}
        </Button>
        <Button size="sm" variant="ghost" onClick={onClose}>
          取消
        </Button>
      </div>
    </div>
  );
}
