"use client";

import { useEffect, useState } from "react";
import { Button, Card, CardContent, CardHeader, CardTitle, Input, Label, Table, TableBody, TableCell, TableHead, TableHeader, TableRow, toast } from "@kenba/ui";
import { adminApi } from "@/lib/admin-api";
import { BodyTextField } from "@/components/body-text-field";
import { zh } from "@/lib/zh";

type ShopRow = {
  id: string;
  name: string;
  description?: string;
  type: string;
  costPoints: number;
  stock: number;
  active: boolean;
  rewardNftId?: string | null;
};

export default function AdminShopPage() {
  const [items, setItems] = useState<ShopRow[]>([]);
  const [form, setForm] = useState({
    id: "" as string | undefined,
    name: "",
    description: "",
    type: "points",
    costPoints: 100,
    stock: 99,
    active: true,
    rewardNftId: "" as string | null,
  });

  const load = () => adminApi.shop().then((r) => setItems(r as ShopRow[]));
  useEffect(() => {
    load();
  }, []);

  async function save() {
    try {
      await adminApi.saveShopItem({
        ...form,
        id: form.id || undefined,
        rewardNftId: form.rewardNftId || null,
      });
      toast.success("商品已保存");
      setForm({ id: undefined, name: "", description: "", type: "points", costPoints: 100, stock: 99, active: true, rewardNftId: null });
      load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "保存失败");
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">{zh.nav.shop}</h1>
      <div className="grid gap-8 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>编辑商品</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Label>{zh.common.name}</Label>
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <BodyTextField label="描述" rows={3} value={form.description} onChange={(description) => setForm({ ...form, description })} />
            <Label>类型</Label>
            <Input value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} />
            <Label>积分价格</Label>
            <Input type="number" value={form.costPoints} onChange={(e) => setForm({ ...form, costPoints: Number(e.target.value) })} />
            <Label>库存</Label>
            <Input type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })} />
            <Label>关联 NFT ID（可选）</Label>
            <Input value={form.rewardNftId ?? ""} onChange={(e) => setForm({ ...form, rewardNftId: e.target.value || null })} />
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} />
              {zh.common.active}
            </label>
            <Button onClick={() => void save()}>保存商品</Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>商品列表</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>名称</TableHead>
                  <TableHead>积分</TableHead>
                  <TableHead>库存</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((it) => (
                  <TableRow
                    key={it.id}
                    className="cursor-pointer"
                    onClick={() =>
                      setForm({
                        id: it.id,
                        name: it.name,
                        description: it.description ?? "",
                        type: it.type,
                        costPoints: it.costPoints,
                        stock: it.stock,
                        active: it.active,
                        rewardNftId: it.rewardNftId ?? null,
                      })
                    }
                  >
                    <TableCell>{it.name}</TableCell>
                    <TableCell>{it.costPoints}</TableCell>
                    <TableCell>{it.stock}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
