"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "framer-motion";

export function CursorTrail() {
  const reduced = useReducedMotion();
  const dotRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (reduced) return;
    const el = dotRef.current;
    if (!el) return;

    let x = 0;
    let y = 0;
    let tx = 0;
    let ty = 0;
    let raf = 0;

    const onMove = (e: MouseEvent) => {
      x = e.clientX;
      y = e.clientY;
    };

    const loop = () => {
      tx += (x - tx) * 0.15;
      ty += (y - ty) * 0.15;
      el.style.transform = `translate3d(${tx}px, ${ty}px, 0)`;
      raf = requestAnimationFrame(loop);
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    raf = requestAnimationFrame(loop);
    return () => {
      window.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(raf);
    };
  }, [reduced]);

  if (reduced) return null;

  return (
    <div
      ref={dotRef}
      className="pointer-events-none fixed left-0 top-0 z-[60] hidden h-8 w-8 -translate-x-1/2 -translate-y-1/2 rounded-full md:block"
      style={{
        background: "radial-gradient(circle, rgba(167,139,250,0.35) 0%, transparent 70%)",
        willChange: "transform",
      }}
      aria-hidden
    />
  );
}
