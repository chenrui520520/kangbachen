"use client";

import {
  Badge,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Separator,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@kenba/ui";
import { useTranslations } from "next-intl";
import { useRewards, useSignInHistory } from "@/hooks/use-engagement";
import { SignInPanel } from "./signin-panel";
import { NftCard } from "./nft-card";

export function RewardsContent() {
  const t = useTranslations("engagement");
  const { data: rewards, isLoading } = useRewards();
  const { data: history } = useSignInHistory();

  return (
    <div className="space-y-8">
      <SignInPanel />

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-border/60 bg-card/80 backdrop-blur-xl">
          <CardHeader>
            <CardTitle>{t("pointsBalance")}</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-semibold">
            {isLoading ? <Skeleton className="h-9 w-24" /> : (rewards?.pointsBalance ?? 0).toLocaleString()}
          </CardContent>
        </Card>
        <Card className="border-border/60 bg-card/80 backdrop-blur-xl">
          <CardHeader>
            <CardTitle>{t("streakLabel")}</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-semibold">
            {isLoading ? <Skeleton className="h-9 w-16" /> : (rewards?.streak ?? 0)}
          </CardContent>
        </Card>
        <Card className="border-border/60 bg-card/80 backdrop-blur-xl">
          <CardHeader>
            <CardTitle>{t("nftCollection")}</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-semibold">
            {isLoading ? <Skeleton className="h-9 w-12" /> : (rewards?.nfts.length ?? 0)}
          </CardContent>
        </Card>
      </div>

      {rewards?.nfts && rewards.nfts.length > 0 && (
        <section>
          <h2 className="mb-4 text-xl font-semibold">{t("nftCollection")}</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {rewards.nfts.map((row) => (
              <NftCard key={row.id} nft={row.nft} subtitle={row.source} />
            ))}
          </div>
        </section>
      )}

      <Separator />

      <Card className="border-border/60 bg-card/80 backdrop-blur-xl">
        <CardHeader>
          <CardTitle>{t("recentActivity")}</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("typeLabel")}</TableHead>
                <TableHead>{t("amountLabel")}</TableHead>
                <TableHead>{t("whenLabel")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(rewards?.transactions ?? []).map((tx) => (
                <TableRow key={tx.id}>
                  <TableCell className="font-medium">{tx.type}</TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {tx.amount > 0 ? `+${tx.amount}` : tx.amount}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(tx.createdAt).toLocaleString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {history && history.length > 0 && (
        <Card className="border-border/60 bg-card/80 backdrop-blur-xl">
          <CardHeader>
            <CardTitle>{t("signInHistory")}</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("cycleDayLabel")}</TableHead>
                  <TableHead>{t("amountLabel")}</TableHead>
                  <TableHead>{t("whenLabel")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {history.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell>Day {row.cycleDay}</TableCell>
                    <TableCell>
                      <Badge variant="outline">+{row.rewardPoints}</Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{row.claimDate}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
