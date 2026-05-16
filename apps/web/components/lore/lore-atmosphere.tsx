"use client";

import { AmbientPlayer } from "@/components/audio/ambient-player";
import { Particles } from "@/components/fx/particles";

export function LoreAtmosphere({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AmbientPlayer />
      <div className="pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(ellipse_at_20%_0%,rgba(60,20,80,0.2),transparent_50%),radial-gradient(ellipse_at_80%_100%,rgba(120,20,30,0.12),transparent_45%)]" />
      <div className="pointer-events-none fixed inset-0 z-0 opacity-40">
        <Particles density={32} />
      </div>
      <div className="relative z-10">{children}</div>
    </>
  );
}
