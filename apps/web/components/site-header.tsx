"use client";

import { LocaleSwitcher, Separator, Button, cn } from "@kenba/ui";
import { AuthHeaderActions } from "@/components/auth/auth-header-actions";
import { MobileNav } from "@/components/layout/mobile-nav";
import { AudioMuteToggle } from "@/components/audio/audio-provider";
import { useLocale } from "next-intl";
import { Link, usePathname, useRouter } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";

const links = [
  { href: "/", key: "home" },
  { href: "/lore", key: "lore" },
  { href: "/campaigns", key: "campaigns" },
  { href: "/tasks", key: "tasks" },
  { href: "/rewards", key: "rewards" },
  { href: "/leaderboard", key: "leaderboard" },
  { href: "/events", key: "events" },
  { href: "/shop", key: "shop" },
  { href: "/invite", key: "invite" },
] as const;

export function SiteHeader({ labels }: { labels: Record<(typeof links)[number]["key"], string> }) {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const isHome = pathname === "/";

  return (
    <header
      className={cn(
        "z-50 border-b backdrop-blur transition-colors",
        isHome
          ? "absolute inset-x-0 top-0 border-transparent bg-gradient-to-b from-black/70 via-black/30 to-transparent"
          : "sticky top-0 border-border/60 bg-background/80",
      )}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-4">
        <div className="flex flex-wrap items-center gap-3">
          <Button asChild variant="ghost" className="px-2 text-sm font-semibold tracking-[0.25em]">
            <Link href="/">KENBA</Link>
          </Button>
          <Separator orientation="vertical" className="hidden h-6 md:block" />
          <nav className="hidden flex-wrap items-center gap-2 text-sm text-muted-foreground md:flex">
            {links.map((l) => (
              <Button key={l.href} asChild variant="ghost" size="sm" className="text-muted-foreground">
                <Link href={l.href}>{labels[l.key]}</Link>
              </Button>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-2">
          <AudioMuteToggle className="shrink-0" />
          <LocaleSwitcher
            locales={routing.locales}
            value={locale}
            onChange={(next) => router.replace(pathname, { locale: next })}
          />
          <div className="hidden md:block">
            <AuthHeaderActions />
          </div>
          <MobileNav labels={labels} />
        </div>
      </div>
    </header>
  );
}
