"use client";

import type { NftSummary } from "@kangba/types";
import { Badge, Card, CardContent, CardHeader, CardTitle } from "@kangba/ui";
import { cn } from "@kangba/ui";

const rarityGlow: Record<string, string> = {
  common: "shadow-[0_0_16px_-4px_hsl(var(--muted-foreground)/0.4)]",
  rare: "shadow-[0_0_24px_-6px_hsl(220_80%_55%/0.5)] border-blue-500/30",
  epic: "shadow-[0_0_28px_-6px_hsl(280_70%_55%/0.55)] border-primary/40",
  legendary: "shadow-[0_0_32px_-6px_hsl(45_90%_55%/0.6)] border-amber-400/50",
};

export function NftCard({ nft, subtitle }: { nft: NftSummary; subtitle?: string }) {
  return (
    <Card
      className={cn(
        "overflow-hidden border-border/60 bg-background/40 backdrop-blur-md",
        rarityGlow[nft.rarity] ?? rarityGlow.common,
      )}
    >
      <div className="aspect-square bg-gradient-to-br from-primary/20 via-background to-accent/10 flex items-center justify-center">
        <span className="text-4xl opacity-40">✦</span>
      </div>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-base">{nft.name}</CardTitle>
          <Badge variant="outline" className="capitalize">
            {nft.rarity}
          </Badge>
        </div>
      </CardHeader>
      {subtitle && <CardContent className="pt-0 text-xs text-muted-foreground">{subtitle}</CardContent>}
    </Card>
  );
}
