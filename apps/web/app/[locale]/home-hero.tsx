"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { Button } from "@kangba/ui";
import { LoginTriggerButton } from "@/components/auth/login-trigger-button";

type Props = {
  title: string;
  subtitle: string;
};

export function HomeHero({ title, subtitle }: Props) {
  const t = useTranslations("home");

  return (
    <main className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(139,92,246,0.25),_transparent_55%),radial-gradient(ellipse_at_bottom,_rgba(185,28,28,0.18),_transparent_50%)]" />
      <div className="relative mx-auto flex max-w-5xl flex-col gap-10 px-6 py-16 md:py-24">
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="space-y-6"
        >
          <h1 className="text-balance text-4xl font-semibold tracking-tight text-foreground md:text-6xl">{title}</h1>
          <p className="max-w-2xl text-pretty text-lg text-muted-foreground md:text-xl">{subtitle}</p>
          <div className="flex flex-wrap gap-3">
            <LoginTriggerButton className="shadow-[0_0_24px_-6px_hsl(var(--primary)/0.6)]" />
            <Button variant="outline" type="button">
              {t("cta_docs")}
            </Button>
          </div>
        </motion.section>
      </div>
    </main>
  );
}
