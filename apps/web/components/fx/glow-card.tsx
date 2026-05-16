"use client";

import type { ReactNode } from "react";
import { cn } from "@kangba/ui";

export function GlowCard({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "group relative rounded-xl border border-primary/20 bg-card/40 p-6 backdrop-blur-md transition-all duration-300",
        "hover:-translate-y-1 hover:border-primary/40 hover:shadow-[0_0_40px_-12px_hsl(var(--primary)/0.45)]",
        className,
      )}
    >
      <div className="pointer-events-none absolute inset-0 rounded-xl bg-gradient-to-br from-primary/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
      <div className="relative">{children}</div>
    </div>
  );
}
