"use client";

import dynamic from "next/dynamic";
import { LandingHero } from "./sections/hero";
import { LandingLore } from "./sections/lore";
import { LandingFactions } from "./sections/factions";
import { LandingCreatures } from "./sections/creatures";
import { LandingTokenEconomy } from "./sections/token-economy";
import { LandingGameplay } from "./sections/gameplay";
import { LandingEventsPreview } from "./sections/events-preview";
import { LandingLeaderboardPreview } from "./sections/leaderboard-preview";
import { LandingRoadmap } from "./sections/roadmap";
import { LandingFaq } from "./sections/faq";
import { LandingFooter } from "./sections/footer";
import { SectionDivider } from "@/components/fx/section-divider";
import { AmbientPlayer } from "@/components/audio/ambient-player";

const MouseSpotlight = dynamic(
  () => import("@/components/fx/mouse-spotlight").then((m) => m.MouseSpotlight),
  { ssr: false },
);

export function LandingPage() {
  return (
    <div className="relative bg-[#0a0514] text-foreground">
      <AmbientPlayer />
      <MouseSpotlight className="fixed z-[1] hidden md:block" />
      <LandingHero />
      <SectionDivider />
      <LandingLore />
      <SectionDivider />
      <LandingFactions />
      <LandingCreatures />
      <LandingTokenEconomy />
      <LandingGameplay />
      <LandingEventsPreview />
      <LandingLeaderboardPreview />
      <LandingRoadmap />
      <LandingFaq />
      <LandingFooter />
    </div>
  );
}
