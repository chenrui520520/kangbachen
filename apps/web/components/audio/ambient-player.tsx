"use client";

import { useEffect } from "react";
import { useAudio } from "./audio-provider";
import { resumeAudioContext, startAmbientDrone, stopAmbientDrone } from "@/lib/ambient-synth";

/** Plays procedural cathedral drone when unmuted. Optional file: /storage/audio/ambient.mp3 */
export function AmbientPlayer({ enabled = true }: { enabled?: boolean }) {
  const { muted, ambientSrc } = useAudio();

  useEffect(() => {
    if (!enabled || muted) {
      stopAmbientDrone();
      return;
    }

    let fileEl: HTMLAudioElement | null = null;

    async function play() {
      if (ambientSrc) {
        fileEl = new Audio(ambientSrc);
        fileEl.loop = true;
        fileEl.volume = 0.25;
        try {
          await fileEl.play();
          return;
        } catch {
          fileEl = null;
        }
      }
      await resumeAudioContext();
      startAmbientDrone();
    }

    void play();

    return () => {
      stopAmbientDrone();
      if (fileEl) {
        fileEl.pause();
        fileEl.src = "";
      }
    };
  }, [enabled, muted, ambientSrc]);

  return null;
}
