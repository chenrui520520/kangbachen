"use client";

import {
  Avatar,
  AvatarFallback,
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@kenba/ui";
import { useTranslations } from "next-intl";
import { useAuthStore } from "@/lib/stores/auth-store";
import { useAuthSignOut } from "@/hooks/use-auth-sign-out";

function shortAddress(addr: string) {
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

export function UserMenu() {
  const t = useTranslations("auth");
  const user = useAuthStore((s) => s.user);
  const signOut = useAuthSignOut();

  if (!user) return null;

  const primaryWallet = user.walletAccounts[0]?.address;
  const label = user.username ?? user.email ?? (primaryWallet ? shortAddress(primaryWallet) : user.id);
  const initials = (label[0] ?? "K").toUpperCase();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2 border-primary/30 pl-2 pr-3">
          <Avatar className="h-7 w-7">
            <AvatarFallback className="bg-primary/20 text-xs text-primary">{initials}</AvatarFallback>
          </Avatar>
          <span className="max-w-[120px] truncate text-sm">{label}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="font-normal">
          <p className="text-sm font-medium">{label}</p>
          <p className="text-xs text-muted-foreground">{t("pointsLabel", { points: user.points })}</p>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {primaryWallet && (
          <DropdownMenuItem disabled className="text-xs text-muted-foreground">
            {shortAddress(primaryWallet)}
          </DropdownMenuItem>
        )}
        <DropdownMenuItem onClick={() => void signOut()}>{t("signOut")}</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
