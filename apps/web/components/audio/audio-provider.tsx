"use client";

import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { cn } from "@kenba/ui";

type AudioContextValue = {
  muted: boolean;
  setMuted: (v: boolean) => void;
  ambientSrc: string | null;
  setAmbientSrc: (src: string | null) => void;
};

const AudioContext = createContext<AudioContextValue | null>(null);

export function AudioProvider({ children }: { children: ReactNode }) {
  const [muted, setMuted] = useState(true);
  const [ambientSrc, setAmbientSrc] = useState<string | null>("/storage/audio/ambient.mp3");

  const value = useMemo(
    () => ({ muted, setMuted, ambientSrc, setAmbientSrc }),
    [muted, ambientSrc],
  );

  return <AudioContext.Provider value={value}>{children}</AudioContext.Provider>;
}

export function useAudio() {
  const ctx = useContext(AudioContext);
  if (!ctx) throw new Error("useAudio must be used within AudioProvider");
  return ctx;
}

export function AudioMuteToggle({ className }: { className?: string }) {
  const { muted, setMuted } = useAudio();
  return (
    <button
      type="button"
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border border-border/50 bg-background/60 px-2.5 py-1.5 text-xs text-muted-foreground transition hover:border-violet-500/40 hover:text-foreground",
        className,
      )}
      onClick={() => setMuted(!muted)}
      aria-pressed={!muted}
      aria-label={muted ? "Unmute cathedral ambient" : "Mute cathedral ambient"}
      title={muted ? "Unmute" : "Mute"}
    >
      {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
      <span className="hidden sm:inline">{muted ? "Sound off" : "Ambient on"}</span>
    </button>
  );
}
