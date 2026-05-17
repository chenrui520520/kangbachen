"use client";

import { Menu } from "lucide-react";
import { Button, Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@kenba/ui";
import { Link } from "@/i18n/navigation";
import { AuthHeaderActions } from "@/components/auth/auth-header-actions";
import { AudioMuteToggle } from "@/components/audio/audio-provider";

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

export function MobileNav({ labels }: { labels: Record<(typeof links)[number]["key"], string> }) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden" aria-label="Menu">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="border-border/60 bg-background/95 backdrop-blur-xl">
        <SheetHeader>
          <SheetTitle className="tracking-[0.25em]">KENBA</SheetTitle>
        </SheetHeader>
        <nav className="mt-8 flex flex-col gap-2">
          {links.map((l) => (
            <Button key={l.href} asChild variant="ghost" className="justify-start">
              <Link href={l.href}>{labels[l.key]}</Link>
            </Button>
          ))}
        </nav>
        <div className="mt-8 flex flex-col gap-4 border-t border-border/50 pt-6">
          <AudioMuteToggle className="w-fit" />
          <AuthHeaderActions />
        </div>
      </SheetContent>
    </Sheet>
  );
}
