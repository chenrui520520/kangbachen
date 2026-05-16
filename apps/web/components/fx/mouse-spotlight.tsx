"use client";

import { useEffect, useState } from "react";
import { cn } from "@kangba/ui";

export function MouseSpotlight({ className }: { className?: string }) {
  const [pos, setPos] = useState({ x: 50, y: 30 });

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      setPos({
        x: (e.clientX / window.innerWidth) * 100,
        y: (e.clientY / window.innerHeight) * 100,
      });
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  return (
    <div
      className={cn("pointer-events-none absolute inset-0 transition-[background] duration-300", className)}
      style={{
        background: `radial-gradient(600px circle at ${pos.x}% ${pos.y}%, rgba(139,92,246,0.12), transparent 45%)`,
      }}
      aria-hidden
    />
  );
}
