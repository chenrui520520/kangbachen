import { Card, CardContent, CardHeader, CardTitle } from "@kangba/ui";

export default function AdminRewardsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">奖励</h1>
      <Card>
        <CardHeader>
          <CardTitle>奖励运营</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          请前往「数据导出」页面，下载签到记录、积分流水与 NFT 发放数据（CSV / JSON），用于空投与运营核对。
        </CardContent>
      </Card>
    </div>
  );
}
