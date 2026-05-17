import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, Button } from "@kenba/ui";
import { zh } from "@/lib/zh";

export default function AdminRewardsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">{zh.nav.rewards}</h1>
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{zh.nav.signin}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>配置 30 天签到周期的每日积分与 NFT 里程碑奖励。</p>
            <Button asChild>
              <Link href="/signin">前往签到奖励配置</Link>
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>{zh.nav.exports}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>导出签到记录、积分流水与 NFT 发放数据（CSV / JSON）。</p>
            <Button asChild variant="outline">
              <Link href="/exports">前往数据导出</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
