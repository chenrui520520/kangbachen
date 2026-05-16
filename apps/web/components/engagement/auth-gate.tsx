"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import { Button, Card, CardContent, CardHeader, CardTitle, Skeleton } from "@kangba/ui";
import { useTranslations } from "next-intl";
import { useIsAuthenticated, useAuthStore } from "@/lib/stores/auth-store";
import { LoginModal } from "@/components/auth/login-modal";

export function AuthGate({ children }: { children: ReactNode }) {
  const t = useTranslations("engagement");
  const hydrated = useAuthStore((s) => s.hydrated);
  const isAuth = useIsAuthenticated();
  const [loginOpen, setLoginOpen] = useState(false);

  if (!hydrated) {
    return (
      <div className="mx-auto max-w-6xl space-y-4 px-6 py-10">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (!isAuth) {
    return (
      <div className="mx-auto max-w-lg px-6 py-16">
        <Card className="border-primary/20 bg-card/80 backdrop-blur-xl">
          <CardHeader>
            <CardTitle>{t("signInRequired")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">{t("signInRequiredHint")}</p>
            <Button className="w-full shadow-[0_0_20px_-6px_hsl(var(--primary)/0.6)]" onClick={() => setLoginOpen(true)}>
              {t("signInCta")}
            </Button>
          </CardContent>
        </Card>
        <LoginModal open={loginOpen} onOpenChange={setLoginOpen} />
      </div>
    );
  }

  return <>{children}</>;
}
