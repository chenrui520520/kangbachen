import { Card, CardContent, CardHeader, CardTitle, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@kangba/ui";
import { adminApi } from "@/lib/admin-api";

export default async function AdminReferralsPage() {
  let rows: unknown[] = [];
  try {
    const data = await adminApi.referrals();
    rows = data.rows;
  } catch {
    rows = [];
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">邀请关系</h1>
      <Card>
        <CardHeader>
          <CardTitle>邀请记录</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>邀请人</TableHead>
                <TableHead>被邀请人</TableHead>
                <TableHead>邀请码</TableHead>
                <TableHead>时间</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(rows as Array<{ referrerEmail?: string; refereeEmail?: string; code?: string; createdAt?: string }>).map(
                (r, i) => (
                  <TableRow key={i}>
                    <TableCell>{r.referrerEmail ?? "—"}</TableCell>
                    <TableCell>{r.refereeEmail ?? "—"}</TableCell>
                    <TableCell className="font-mono">{r.code ?? "—"}</TableCell>
                    <TableCell className="text-muted-foreground">{r.createdAt ?? "—"}</TableCell>
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
