"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  Input,
  Label,
  Separator,
  toast,
} from "@kangba/ui";
import { useTranslations } from "next-intl";
import { useWalletAuth } from "@/hooks/use-wallet-auth";
import { authApi, ApiClientError } from "@/lib/api-client";
import { useAuthStore } from "@/lib/stores/auth-store";

type LoginModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function LoginModal({ open, onOpenChange }: LoginModalProps) {
  const t = useTranslations("auth");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [emailStep, setEmailStep] = useState<"request" | "verify">("request");
  const [emailPending, setEmailPending] = useState(false);
  const { signInWithWallet, pending: walletPending, openConnectModal, isConnected } = useWalletAuth();
  const setSession = useAuthStore((s) => s.setSession);

  async function handleWallet() {
    try {
      if (!isConnected) {
        openConnectModal?.();
        return;
      }
      await signInWithWallet();
      onOpenChange(false);
    } catch {
      // toast handled in hook
    }
  }

  async function handleEmailRequest(e: React.FormEvent) {
    e.preventDefault();
    setEmailPending(true);
    try {
      await authApi.emailRequest(email);
      setEmailStep("verify");
      toast.success(t("emailCodeSent"));
    } catch (err) {
      toast.error(err instanceof ApiClientError ? err.message : t("emailError"));
    } finally {
      setEmailPending(false);
    }
  }

  async function handleEmailVerify(e: React.FormEvent) {
    e.preventDefault();
    setEmailPending(true);
    try {
      const session = await authApi.emailVerify(email, code);
      setSession(session);
      toast.success(t("signedIn"));
      onOpenChange(false);
    } catch (err) {
      toast.error(err instanceof ApiClientError ? err.message : t("emailError"));
    } finally {
      setEmailPending(false);
    }
  }

  async function handleTwitter() {
    try {
      await authApi.twitterPlaceholder();
    } catch (err) {
      if (err instanceof ApiClientError && err.status === 501) {
        toast.info(t("twitterPlaceholder"));
      } else {
        toast.error(t("twitterError"));
      }
    }
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
            key="wallet"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <section className="rounded-lg border border-primary/20 bg-background/40 p-4 shadow-[0_0_24px_-8px_hsl(var(--primary)/0.4)]">
              <h3 className="mb-2 text-sm font-medium text-primary">{t("walletSection")}</h3>
              <p className="mb-3 text-xs text-muted-foreground">{t("walletHint")}</p>
              <Button
                className="w-full shadow-[0_0_20px_-6px_hsl(var(--primary)/0.6)]"
                onClick={() => void handleWallet()}
                disabled={walletPending}
              >
                {walletPending ? t("signing") : isConnected ? t("signWithWallet") : t("connectWallet")}
              </Button>
            </section>

            <Separator />

            <section className="rounded-lg border border-border/60 bg-background/30 p-4">
              <h3 className="mb-2 text-sm font-medium">{t("emailSection")}</h3>
              {emailStep === "request" ? (
                <form onSubmit={(e) => void handleEmailRequest(e)} className="space-y-3">
                  <motion.div layout>
                    <Label htmlFor="auth-email">{t("emailLabel")}</Label>
                    <Input
                      id="auth-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      required
                      className="mt-1"
                    />
                  </motion.div>
                  <Button type="submit" variant="secondary" className="w-full" disabled={emailPending}>
                    {emailPending ? t("sending") : t("sendCode")}
                  </Button>
                </form>
              ) : (
                <form onSubmit={(e) => void handleEmailVerify(e)} className="space-y-3">
                  <div>
                    <Label htmlFor="auth-code">{t("codeLabel")}</Label>
                    <Input
                      id="auth-code"
                      inputMode="numeric"
                      maxLength={6}
                      value={code}
                      onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                      placeholder="000000"
                      required
                      className="mt-1 font-mono tracking-widest"
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={emailPending || code.length !== 6}>
                    {emailPending ? t("verifying") : t("verifyCode")}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="w-full"
                    onClick={() => setEmailStep("request")}
                  >
                    {t("changeEmail")}
                  </Button>
                </form>
              )}
            </section>

            <Separator />

            <section>
              <Button
                type="button"
                variant="outline"
                className="w-full border-border/80"
                onClick={() => void handleTwitter()}
              >
                {t("twitterSignIn")}
              </Button>
              <p className="mt-2 text-center text-xs text-muted-foreground">{t("twitterHint")}</p>
            </section>
          </motion.div>
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
