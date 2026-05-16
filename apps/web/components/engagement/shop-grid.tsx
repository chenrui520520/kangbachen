"use client";

import type { ShopItemDto } from "@kangba/types";
import { Badge, Button, Card, CardContent, CardFooter, CardHeader, CardTitle, Skeleton, toast } from "@kangba/ui";
import { useTranslations } from "next-intl";
import { useShop, useShopPurchase } from "@/hooks/use-engagement";
import { ApiClientError } from "@/lib/api-client";

export function ShopGrid() {
  const t = useTranslations("engagement");
  const { data: items, isLoading } = useShop();
  const purchase = useShopPurchase();

  async function handlePurchase(item: ShopItemDto) {
    try {
      const res = await purchase.mutateAsync(item.id);
      toast.success(t("purchaseSuccess", { cost: res.costPoints }));
    } catch (err) {
      const msg = err instanceof ApiClientError ? err.message : t("purchaseFailed");
      toast.error(msg);
    }
  }

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-56 w-full" />
        ))}
      </div>
    );
  }

  if (!items?.length) {
    return <p className="text-sm text-muted-foreground">{t("shopEmpty")}</p>;
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => (
        <Card key={item.id} className="flex flex-col border-border/60 bg-card/70 backdrop-blur-md">
          <CardHeader>
            <div className="flex items-start justify-between gap-3">
              <CardTitle className="text-lg">{item.rewardNft?.name ?? item.name}</CardTitle>
              <Badge variant="outline">
                {item.costPoints} {t("points")}
              </Badge>
            </div>
            {item.rewardNft && (
              <Badge variant="secondary" className="mt-2 w-fit capitalize">
                {item.rewardNft.rarity} NFT
              </Badge>
            )}
          </CardHeader>
          {item.description && (
            <CardContent className="pt-0 text-sm text-muted-foreground">{item.description}</CardContent>
          )}
          <CardFooter className="mt-auto flex items-center justify-between gap-2 border-t border-border/40 p-4">
            <span className="text-xs text-muted-foreground">
              {item.stock > 0 ? `${item.stock} left` : t("outOfStock")}
            </span>
            <Button
              size="sm"
              disabled={item.stock <= 0 || purchase.isPending}
              onClick={() => void handlePurchase(item)}
            >
              {t("redeem")}
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
