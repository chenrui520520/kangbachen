"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export function CampaignCountdown({ endsAt }: { endsAt: string }) {
  const [left, setLeft] = useState({ d: 0, h: 0, m: 0, s: 0 });

  useEffect(() => {
    const tick = () => {
      const diff = Math.max(0, new Date(endsAt).getTime() - Date.now());
      setLeft({
        d: Math.floor(diff / 86400000),
        h: Math.floor((diff % 86400000) / 3600000),
        m: Math.floor((diff % 3600000) / 60000),
        s: Math.floor((diff % 60000) / 1000),
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [endsAt]);

  const units = [
    { label: "Days", value: left.d },
    { label: "Hours", value: left.h },
    { label: "Min", value: left.m },
    { label: "Sec", value: left.s },
  ];

  return (
    <motion.div className="mt-6 flex flex-wrap gap-3" role="timer">
      {units.map((u) => (
        <motion.div
          key={u.label}
          className="min-w-[4rem] rounded-lg border border-violet-500/30 bg-black/40 px-3 py-2 text-center backdrop-blur"
          animate={{
            boxShadow: [
              "0 0 12px rgba(139,92,246,0.2)",
              "0 0 20px rgba(139,92,246,0.35)",
              "0 0 12px rgba(139,92,246,0.2)",
            ],
          }}
          transition={{ duration: 3, repeat: Infinity }}
        >
          <div className="text-xl font-bold tabular-nums">{String(u.value).padStart(2, "0")}</div>
          <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{u.label}</div>
        </motion.div>
      ))}
    </motion.div>
  );
}
