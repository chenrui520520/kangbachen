"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Button, Separator } from "@kenba/ui";
import { adminAuthStore } from "@/lib/admin-auth-store";
import { zh } from "@/lib/zh";

const links = [
  { href: "/dashboard", label: zh.nav.dashboard },
  { href: "/analytics", label: zh.nav.analytics },
  { href: "/users", label: zh.nav.users },
  { href: "/referrals", label: zh.nav.referrals },
  { href: "/cms", label: zh.nav.cms },
  { href: "/media", label: zh.nav.media },
  { href: "/lore", label: zh.nav.lore },
  { href: "/campaigns", label: zh.nav.campaigns },
  { href: "/docs", label: zh.nav.docs },
  { href: "/monitoring", label: zh.nav.monitoring },
  { href: "/events", label: zh.nav.events },
  { href: "/community", label: zh.nav.community },
  { href: "/rewards", label: zh.nav.rewards },
  { href: "/signin", label: zh.nav.signin },
  { href: "/tasks", label: zh.nav.tasks },
  { href: "/nfts", label: zh.nav.nfts },
  { href: "/shop", label: zh.nav.shop },
  { href: "/exports", label: zh.nav.exports },
  { href: "/audit", label: zh.nav.audit },
  { href: "/system", label: zh.nav.system },
  { href: "/settings", label: zh.nav.settings },
] as const;

export function AdminShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const isLogin = pathname === "/login" || pathname?.endsWith("/login");

  if (isLogin) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-dvh bg-background text-foreground">
      <div className="grid min-h-dvh lg:grid-cols-[240px_1fr]">
        <aside className="border-b border-border lg:border-b-0 lg:border-r">
          <div className="p-6">
            <div className="text-xs font-semibold tracking-[0.35em] text-muted-foreground">{zh.brand}</div>
            <div className="mt-2 text-lg font-semibold">{zh.appTitle}</div>
            <Separator className="my-4" />
            <nav className="flex flex-col gap-1">
              {links.map((l) => {
                const active = pathname === l.href || pathname?.endsWith(l.href);
                return (
                  <Button key={l.href} asChild variant={active ? "secondary" : "ghost"} className="justify-start">
                    <Link href={l.href}>{l.label}</Link>
                  </Button>
                );
              })}
            </nav>
            <Separator className="my-4" />
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => {
                adminAuthStore.clear();
                router.push("/login");
              }}
            >
              退出登录
            </Button>
          </div>
        </aside>
        <main className="min-w-0 p-6 lg:p-10">{children}</main>
      </div>
    </div>
  );
}
