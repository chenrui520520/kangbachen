"use client";

import type { ReactNode } from "react";
import { usePrefersReducedMotion } from "@/hooks/use-reduced-motion";

/** CSS smooth scroll; disabled when user prefers reduced motion. */
export function SmoothScrollProvider({ children }: { children: ReactNode }) {
  const reduced = usePrefersReducedMotion();
  return <div className={reduced ? "" : "scroll-smooth"}>{children}</div>;
}
