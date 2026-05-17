"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";
import { useLocale } from "next-intl";
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  Separator,
  toast,
} from "@kenba/ui";
import { useTranslations } from "next-intl";
import { WalletLoginSection } from "@/components/auth/wallet-login-section";
import { authApi } from "@/lib/api-client";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ?? "http://127.0.0.1:4000";

const enableTwitter = process.env.NEXT_PUBLIC_ENABLE_TWITTER_LOGIN !== "false";
const enableEmail = process.env.NEXT_PUBLIC_ENABLE_EMAIL_LOGIN !== "false";

type LoginModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function LoginModal({ open, onOpenChange }: LoginModalProps) {
  const t = useTranslations("auth");
  const locale = useLocale();
  const pathname = usePathname();
  const [providers, setProviders] = useState<{ google: boolean; twitter: boolean } | null>(null);

  useEffect(() => {
    if (!open) return;
    void authApi
      .providers()
      .then(setProviders)
      .catch(() => setProviders({ google: false, twitter: false }));
  }, [open]);

  function startOAuth(provider: "google" | "twitter") {
    const returnTo = pathname || `/${locale}`;
    sessionStorage.setItem("KENBA-oauth-return", returnTo);
    window.location.href = `${API_BASE}/api/login/${provider}?returnTo=${encodeURIComponent(returnTo)}`;
  }

  function handleEmailLogin() {
    if (!providers?.google) {
      toast.error(t("emailNotConfigured"));
      return;
    }
    startOAuth("google");
  }

  function handleTwitterLogin() {
    if (!providers?.twitter) {
      toast.error(t("twitterNotConfigured"));
      return;
    }
    startOAuth("twitter");
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md border-border/60 bg-card/95 backdrop-blur-xl">
        <DialogHeader>
          <DialogTitle className="text-xl tracking-wide">{t("title")}</DialogTitle>
          <DialogDescription>{t("subtitle")}</DialogDescription>
        </DialogHeader>

        <AnimatePresence mode="wait">
          <motion.div
            key="login"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <section className="rounded-lg border border-primary/20 bg-background/40 p-4 shadow-[0_0_24px_-8px_hsl(var(--primary)/0.4)]">
              <h3 className="mb-2 text-sm font-medium text-primary">{t("walletSection")}</h3>
              <p className="mb-3 text-xs text-muted-foreground">{t("walletHint")}</p>
              <WalletLoginSection onSuccess={() => onOpenChange(false)} />
            </section>

            {enableEmail ? (
              <>
                <Separator />
                <section className="rounded-lg border border-border/60 bg-background/30 p-4">
                  <h3 className="mb-2 text-sm font-medium">{t("emailSection")}</h3>
                  <p className="mb-3 text-xs text-muted-foreground">{t("emailHint")}</p>
                  <Button
                    type="button"
                    variant="secondary"
                    className="w-full"
                    onClick={handleEmailLogin}
                    disabled={providers !== null && !providers.google}
                  >
                    {t("emailSignIn")}
                  </Button>
                </section>
              </>
            ) : null}

            {enableTwitter ? (
              <>
                <Separator />
                <section>
                  <p className="mb-2 text-xs text-muted-foreground">{t("twitterHint")}</p>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full border-border/80"
                    onClick={handleTwitterLogin}
                    disabled={providers !== null && !providers.twitter}
                  >
                    {t("twitterSignIn")}
                  </Button>
                </section>
              </>
            ) : null}
          </motion.div>
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
