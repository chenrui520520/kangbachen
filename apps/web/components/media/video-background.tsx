"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@kangba/ui";

type Props = {
  className?: string;
  overlayClassName?: string;
  webmSrc?: string;
  mp4Src?: string;
  posterSrc?: string;
};

export function VideoBackground({
  className,
  overlayClassName,
  webmSrc = "/storage/videos/hero.webm",
  mp4Src = "/storage/videos/hero.mp4",
  posterSrc = "/storage/videos/hero-poster.jpg",
}: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [useVideo, setUseVideo] = useState(true);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const narrow = window.matchMedia("(max-width: 768px)");
    const update = () => {
      setReducedMotion(mq.matches);
      if (mq.matches || narrow.matches) setUseVideo(false);
    };
    update();
    mq.addEventListener("change", update);
    narrow.addEventListener("change", update);
    return () => {
      mq.removeEventListener("change", update);
      narrow.removeEventListener("change", update);
    };
  }, []);

  useEffect(() => {
    const el = videoRef.current;
    if (!el || !useVideo) return;
    el.play().catch(() => setUseVideo(false));
  }, [useVideo]);

  return (
    <div className={cn("absolute inset-0 overflow-hidden", className)}>
      {useVideo && !reducedMotion ? (
        <video
          ref={videoRef}
          className="h-full w-full object-cover opacity-70 will-change-transform"
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          poster={posterSrc}
        >
          <source src={webmSrc} type="video/webm" />
          <source src={mp4Src} type="video/mp4" />
        </video>
      ) : (
        <div
          className="h-full w-full bg-cover bg-center opacity-80"
          style={{
            backgroundImage: `linear-gradient(180deg, rgba(10,5,20,0.3), rgba(10,5,20,0.9)), url(${posterSrc})`,
          }}
        />
      )}
      <div
        className={cn(
          "absolute inset-0 bg-gradient-to-b from-[#0a0514]/40 via-[#0a0514]/70 to-[#0a0514]",
          overlayClassName,
        )}
      />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_30%_20%,rgba(139,92,246,0.2),transparent_50%),radial-gradient(ellipse_at_70%_80%,rgba(185,28,28,0.15),transparent_45%)]" />
    </div>
  );
}
