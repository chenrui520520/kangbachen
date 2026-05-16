"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useTranslations } from "next-intl";
import { Button } from "@kangba/ui";
import { Link } from "@/i18n/navigation";
import { VideoBackground } from "@/components/media/video-background";
import { Particles } from "@/components/fx/particles";
import { LoginTriggerButton } from "@/components/auth/login-trigger-button";

export function LandingHero() {
  const t = useTranslations("landing");
  const reduced = useReducedMotion();

  return (
    <section className="relative flex min-h-[100dvh] flex-col justify-center overflow-hidden">
      <VideoBackground />
      <Particles density={56} />
      <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-col gap-10 px-6 py-24 md:py-32">
        <motion.div
          initial={reduced ? false : { opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          className="inline-flex w-fit items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1 text-xs uppercase tracking-[0.35em] text-primary"
        >
          {t("hero.badge")}
        </motion.div>

        <motion.h1
          initial={reduced ? false : { opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.15 }}
          className="max-w-4xl text-balance text-5xl font-bold tracking-tight md:text-7xl lg:text-8xl"
        >
          <span className="bg-gradient-to-br from-violet-200 via-fuchsia-200 to-red-300 bg-clip-text text-transparent">
            {t("hero.title")}
          </span>
        </motion.h1>

        <motion.p
          initial={reduced ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="max-w-2xl text-lg text-muted-foreground md:text-xl"
        >
          {t("hero.subtitle")}
        </motion.p>

        <motion.div
          initial={reduced ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.45 }}
          className="flex flex-wrap gap-4"
        >
          <LoginTriggerButton
            size="lg"
            className="shadow-[0_0_32px_-8px_hsl(var(--primary)/0.8)] hover:shadow-[0_0_48px_-6px_hsl(var(--primary))]"
          />
          <Button
            asChild
            size="lg"
            variant="outline"
            className="border-primary/40 bg-background/20 backdrop-blur hover:border-primary hover:shadow-[0_0_24px_-8px_hsl(var(--primary)/0.5)]"
          >
            <Link href="/rewards">{t("hero.ctaRewards")}</Link>
          </Button>
          <Button
            asChild
            size="lg"
            variant="outline"
            className="border-border/60 bg-background/10 backdrop-blur"
          >
            <Link href="/lore">{t("hero.ctaLore")}</Link>
          </Button>
          <Button asChild size="lg" variant="ghost" className="text-muted-foreground">
            <Link href="/invite">{t("hero.ctaInvite")}</Link>
          </Button>
        </motion.div>
      </div>
      <div className="pointer-events-none absolute bottom-8 left-1/2 z-10 -translate-x-1/2 text-xs uppercase tracking-widest text-muted-foreground animate-bounce">
        {t("hero.scroll")}
      </div>
    </section>
  );
}
