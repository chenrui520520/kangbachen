import { UsersTable } from "@/components/users-table";
import { zh } from "@/lib/zh";

export default function AdminUsersPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">{zh.nav.users}</h1>
        <p className="mt-2 text-sm text-muted-foreground">查询与管理平台用户。</p>
      </div>
      <UsersTable />
    </div>
  );
}
