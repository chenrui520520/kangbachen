"use client";

import { useEffect, useState } from "react";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  Label,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  toast,
} from "@kenba/ui";
import { adminApi } from "@/lib/admin-api";
import { zh } from "@/lib/zh";

type SignInRow = {
  day: number;
  rewardPoints: number;
  nftRewardId: string | null;
  nftReward?: { id: string; name: string; rarity: string } | null;
};

export default function AdminSignInRewardsPage() {
  const [rows, setRows] = useState<SignInRow[]>([]);
  const [form, setForm] = useState({ day: 1, rewardPoints: 50, nftRewardId: "" as string | null });
  const [bulkDays, setBulkDays] = useState(30);

  const load = () => adminApi.signInRewards().then((r) => setRows(r as SignInRow[]));
  useEffect(() => {
    load();
  }, []);

  async function save() {
    try {
      await adminApi.saveSignInReward({
        day: form.day,
        rewardPoints: form.rewardPoints,
        nftRewardId: form.nftRewardId || null,
      });
      toast.success(`第 ${form.day} 天奖励已保存`);
      load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "保存失败");
    }
  }

  async function initCycle() {
    if (!confirm(`将初始化 1–${bulkDays} 天默认积分曲线（不覆盖已有 NFT 关联）？`)) return;
    try {
      for (let day = 1; day <= bulkDays; day++) {
        const existing = rows.find((r) => r.day === day);
        const rewardPoints = 50 + day * 15;
        await adminApi.saveSignInReward({
          day,
          rewardPoints,
          nftRewardId: existing?.nftRewardId ?? null,
        });
      }
      toast.success("已批量初始化签到积分");
      load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "初始化失败");
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">{zh.nav.signin}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          配置 30 天签到周期的每日积分与 NFT 奖励，前台签到页将读取此表。
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>编辑单日奖励</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Label>签到日（1–30）</Label>
            <Input
              type="number"
              min={1}
              max={30}
              value={form.day}
              onChange={(e) => setForm({ ...form, day: Number(e.target.value) })}
            />
            <Label>奖励积分</Label>
            <Input
              type="number"
              min={0}
              value={form.rewardPoints}
              onChange={(e) => setForm({ ...form, rewardPoints: Number(e.target.value) })}
            />
            <Label>NFT 奖励 ID（可选，见 NFT 奖励页）</Label>
            <Input
              value={form.nftRewardId ?? ""}
              onChange={(e) => setForm({ ...form, nftRewardId: e.target.value || null })}
              placeholder="留空则仅发积分"
            />
            <Button onClick={() => void save()}>保存</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>批量工具</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Label>初始化天数</Label>
            <Input type="number" min={1} max={30} value={bulkDays} onChange={(e) => setBulkDays(Number(e.target.value))} />
            <p className="text-xs text-muted-foreground">按公式「50 + 天数×15」写入积分，保留各天已有 NFT 配置。</p>
            <Button variant="outline" onClick={() => void initCycle()}>
              批量初始化积分曲线
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>30 天奖励表</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>天数</TableHead>
                <TableHead>积分</TableHead>
                <TableHead>NFT</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((r) => (
                <TableRow key={r.day}>
                  <TableCell>第 {r.day} 天</TableCell>
                  <TableCell>{r.rewardPoints}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {r.nftReward ? `${r.nftReward.name} (${r.nftReward.rarity})` : "—"}
                  </TableCell>
                  <TableCell>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() =>
                        setForm({
                          day: r.day,
                          rewardPoints: r.rewardPoints,
                          nftRewardId: r.nftRewardId,
                        })
                      }
                    >
                      编辑
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
