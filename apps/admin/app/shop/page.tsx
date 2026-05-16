import { Card, CardContent, CardHeader, CardTitle, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@kangba/ui";
import { adminApi } from "@/lib/admin-api";

export default async function AdminShopPage() {
  let items: unknown[] = [];
  try {
    items = await adminApi.shop();
  } catch {
    items = [];
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">积分商城</h1>
      <Card>
        <CardHeader>
          <CardTitle>商品库存</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>名称</TableHead>
                <TableHead>积分价格</TableHead>
                <TableHead>库存</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(items as Array<{ id: string; name: string; costPoints: number; stock: number }>).map((it) => (
                <TableRow key={it.id}>
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
  );
}
