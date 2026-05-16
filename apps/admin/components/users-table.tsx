"use client";

import { useEffect, useState } from "react";
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@kangba/ui";
import { adminApi } from "@/lib/admin-api";
import { zh } from "@/lib/zh";

type UserRow = {
  id: string;
  email: string | null;
  username: string | null;
  points: number;
  signInStreak: number;
  referralCode?: { code: string } | null;
  walletAccounts: { address: string }[];
};

export function UsersTable() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [data, setData] = useState<{ total: number; users: UserRow[] } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void adminApi
      .users(page, search || undefined)
      .then((res) => setData(res as { total: number; users: UserRow[] }))
      .catch((e: Error) => setError(e.message));
  }, [page, search]);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-4">
        <CardTitle>{zh.nav.users}</CardTitle>
        <Input
          placeholder="搜索邮箱或用户名"
          className="max-w-xs"
          value={search}
          onChange={(e) => {
            setPage(1);
            setSearch(e.target.value);
          }}
        />
      </CardHeader>
      <CardContent>
        {error && <p className="mb-4 text-sm text-destructive">{error}</p>}
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>邮箱</TableHead>
              <TableHead>积分</TableHead>
              <TableHead>连续签到</TableHead>
              <TableHead>邀请码</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(data?.users ?? []).map((u) => (
              <TableRow key={u.id}>
                <TableCell className="font-mono text-xs">{u.id.slice(0, 8)}…</TableCell>
                <TableCell>{u.email ?? u.username ?? "—"}</TableCell>
                <TableCell>{u.points}</TableCell>
                <TableCell>{u.signInStreak}</TableCell>
                <TableCell>
                  {u.referralCode ? <Badge variant="outline">{u.referralCode.code}</Badge> : "—"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <div className="mt-4 flex items-center justify-between">
          <p className="text-sm text-muted-foreground">共 {data?.total ?? 0} 条</p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
              {zh.common.prev}
            </Button>
            <Button variant="outline" size="sm" onClick={() => setPage((p) => p + 1)}>
              {zh.common.next}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
