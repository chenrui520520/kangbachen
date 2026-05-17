import { Card, CardContent, CardHeader, CardTitle, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@kenba/ui";
import { adminApi } from "@/lib/admin-api";

export default async function AdminAuditPage() {
  let rows: unknown[] = [];
  try {
    const data = await adminApi.audit();
    rows = data.rows;
  } catch {
    rows = [];
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">审计日志</h1>
      <Card>
        <CardHeader>
          <CardTitle>最近操作</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>操作</TableHead>
                <TableHead>资源</TableHead>
                <TableHead>时间</TableHead>
                <TableHead>IP</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(rows as Array<{ action?: string; resource?: string; createdAt?: string; ipAddress?: string }>).map(
                (r, i) => (
                  <TableRow key={i}>
                    <TableCell>{r.action ?? "—"}</TableCell>
                    <TableCell>{r.resource ?? "—"}</TableCell>
                    <TableCell className="text-muted-foreground">{r.createdAt ?? "—"}</TableCell>
                    <TableCell className="text-muted-foreground">{r.ipAddress ?? "—"}</TableCell>
                  </TableRow>
                ),
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
