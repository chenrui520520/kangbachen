"use client";

import { motion } from "framer-motion";
import { cn } from "@kangba/ui";
import { Link } from "@/i18n/navigation";
import { usePrefersReducedMotion } from "@/hooks/use-reduced-motion";

const rarityGlow: Record<string, string> = {
  common: "shadow-[0_0_24px_rgba(120,120,140,0.25)]",
  rare: "shadow-[0_0_28px_rgba(139,92,246,0.35)]",
  epic: "shadow-[0_0_32px_rgba(220,38,38,0.35)]",
  legendary: "shadow-[0_0_40px_rgba(251,191,36,0.4)]",
};

export function LoreCard({
  href,
  name,
  subtitle,
  rarity = "common",
  imageUrl,
  theme = "violet",
}: {
  href: string;
  name: string;
  subtitle?: string;
  rarity?: string;
  imageUrl?: string | null;
  theme?: string;
}) {
  const reduced = usePrefersReducedMotion();
  return (
    <motion.div
      whileHover={reduced ? undefined : { y: -4, scale: 1.02 }}
      transition={reduced ? { duration: 0 } : { type: "spring", stiffness: 300, damping: 22 }}
    >
      <Link
        href={href}
        className={cn(
          "group relative block overflow-hidden rounded-xl border border-border/60 bg-card/80 p-5 backdrop-blur",
          rarityGlow[rarity] ?? rarityGlow.common,
        )}
      >
        <motion.div
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity group-hover:opacity-100"
          style={{
            background: `radial-gradient(circle at 50% 0%, var(--faction-${theme}, rgba(139,92,246,0.15)), transparent 70%)`,
          }}
        />
        {imageUrl ? (
          <div
            className="mb-4 aspect-[4/3] rounded-lg bg-cover bg-center"
            style={{ backgroundImage: `url(${imageUrl})` }}
          />
        ) : (
          <motion.div
            className="mb-4 flex aspect-[4/3] items-center justify-center rounded-lg bg-muted/40 text-4xl font-bold text-muted-foreground/40"
            animate={{ opacity: [0.5, 0.8, 0.5] }}
            transition={{ duration: 4, repeat: Infinity }}
          >
            {name.charAt(0)}
          </motion.div>
        )}
        <div className="relative">
          <div className="text-xs uppercase tracking-widest text-muted-foreground">{rarity}</div>
          <h3 className="mt-1 text-lg font-semibold">{name}</h3>
          {subtitle ? <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p> : null}
        </div>
      </Link>
    </motion.div>
  );
}
