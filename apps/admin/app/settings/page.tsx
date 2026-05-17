"use client";

import { useEffect, useState } from "react";
import { Button, Card, CardContent, CardHeader, CardTitle, Input, Label, toast } from "@kenba/ui";
import { adminApi } from "@/lib/admin-api";
import { zh } from "@/lib/zh";

const ROLE_LABEL: Record<string, string> = {
  SUPERADMIN: "超级管理员",
  EDITOR: "编辑",
  VIEWER: "只读",
};

export default function AdminSettingsPage() {
  const [profile, setProfile] = useState<{ email: string; role: string } | null>(null);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    adminApi
      .me()
      .then((u) => setProfile({ email: u.email, role: u.role }))
      .catch(() => toast.error("请先登录"));
  }, []);

  async function onChangePassword(e: React.FormEvent) {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error("两次输入的新密码不一致");
      return;
    }
    if (newPassword.length < 8) {
      toast.error("新密码至少 8 位");
      return;
    }
    setSaving(true);
    try {
      await adminApi.changePassword(currentPassword, newPassword);
      toast.success("密码已更新");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "修改失败");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">{zh.nav.settings}</h1>
        <p className="mt-1 text-sm text-muted-foreground">管理当前登录账号与密码。</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>当前账号</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>
            <span className="text-muted-foreground">邮箱：</span>
            {profile?.email ?? "—"}
          </p>
          <p>
            <span className="text-muted-foreground">角色：</span>
            {profile ? (ROLE_LABEL[profile.role] ?? profile.role) : "—"}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>修改密码</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={(e) => void onChangePassword(e)}>
            <div>
              <Label htmlFor="current">当前密码</Label>
              <Input
                id="current"
                type="password"
                autoComplete="current-password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="new">新密码</Label>
              <Input
                id="new"
                type="password"
                autoComplete="new-password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={8}
              />
            </div>
            <div>
              <Label htmlFor="confirm">确认新密码</Label>
              <Input
                id="confirm"
                type="password"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={8}
              />
            </div>
            <p className="text-xs text-muted-foreground">密码至少 8 位。修改后需重新登录。</p>
            <Button type="submit" disabled={saving}>
              {saving ? "保存中…" : "更新密码"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
