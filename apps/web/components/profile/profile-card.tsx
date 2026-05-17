"use client";

import { motion } from "framer-motion";
import type { PublicProfile } from "@kenba/types";
import { cn } from "@kenba/ui";
import { ProfileShare } from "./profile-share";

const frameByRarity: Record<string, string> = {
  common: "border-muted",
  rare: "border-violet-500/60 shadow-[0_0_20px_rgba(139,92,246,0.3)]",
  epic: "border-red-500/50 shadow-[0_0_24px_rgba(220,38,38,0.25)]",
  legendary: "border-amber-400/60 shadow-[0_0_28px_rgba(251,191,36,0.35)]",
};

export function ProfileCard({ profile }: { profile: PublicProfile }) {
  const name = profile.user.username ?? `Player ${profile.user.id.slice(0, 6)}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="overflow-hidden rounded-2xl border border-border/60 bg-gradient-to-br from-card via-card to-violet-950/30"
    >
      <div className="relative p-8">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(139,92,246,0.15),transparent_50%)]" />
        <div className="relative flex flex-wrap items-start gap-6">
          <div className="flex h-20 w-20 items-center justify-center rounded-full border-2 border-violet-500/50 bg-muted text-2xl font-bold">
            {name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="text-2xl font-bold">{name}</h1>
            <p className="text-sm text-muted-foreground">
              Member since {new Date(profile.user.memberSince).toLocaleDateString()}
            </p>
            <div className="mt-4 flex flex-wrap gap-4 text-sm">
              <Stat label="Points" value={profile.user.points} />
              <Stat label="Streak" value={profile.user.signInStreak} />
              <Stat label="Referrals" value={profile.referral.count} />
              <Stat label="Reputation" value={profile.community.reputation} />
              <Stat label="Chronicles" value={profile.lore?.campaignsCompleted ?? profile.community.campaignsCompleted ?? 0} />
            </div>
            {profile.community.roleName ? (
              <p className="mt-3 text-sm text-violet-400">{profile.community.roleName}</p>
            ) : null}
            <div className="mt-4">
              <ProfileShare userId={profile.user.id} />
            </div>
          </div>
        </div>

        {profile.community.badges.length > 0 ? (
          <div className="relative mt-8">
            <h2 className="text-sm font-semibold tracking-widest text-muted-foreground">BADGES</h2>
            <div className="mt-3 flex flex-wrap gap-3">
              {profile.community.badges.map((b) => (
                <motion.div
                  key={b.key}
                  whileHover={{ scale: 1.05 }}
                  className={cn(
                    "rounded-lg border px-3 py-2 text-xs",
                    frameByRarity[b.rarity] ?? frameByRarity.common,
                  )}
                  title={b.description ?? undefined}
                >
                  <span className="font-semibold">{b.name}</span>
                  <span className="ml-2 text-muted-foreground">{b.rarity}</span>
                </motion.div>
              ))}
            </div>
          </div>
        ) : null}

        {profile.nfts.length > 0 ? (
          <div className="relative mt-8">
            <h2 className="text-sm font-semibold tracking-widest text-muted-foreground">COLLECTIBLES</h2>
            <div className="mt-3 grid grid-cols-3 gap-3 sm:grid-cols-4">
              {profile.nfts.map((n) => (
                <div key={n.id} className="rounded-lg border border-border/40 bg-muted/30 p-2 text-center text-xs">
                  <div className="font-medium">{n.name}</div>
                  <div className="text-muted-foreground">{n.rarity}</div>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </motion.div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="text-lg font-semibold tabular-nums">{value.toLocaleString()}</div>
    </div>
  );
}
