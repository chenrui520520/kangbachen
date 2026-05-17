"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { toast } from "@kenba/ui";
import { authApi } from "@/lib/api-client";
import { useAuthStore } from "@/lib/stores/auth-store";

function AuthCallbackInner() {
  const t = useTranslations("auth");
  const locale = useLocale();
  const router = useRouter();
  const params = useSearchParams();
  const setSession = useAuthStore((s) => s.setSession);
  const [status, setStatus] = useState<"loading" | "error">("loading");

  useEffect(() => {
    const error = params.get("error");
    if (error) {
      setStatus("error");
      toast.error(decodeURIComponent(error));
      router.replace(`/${locale}`);
      return;
    }

    const ticket = params.get("ticket");
    if (!ticket) {
      setStatus("error");
      toast.error(t("oauthError"));
      router.replace(`/${locale}`);
      return;
    }

    void (async () => {
      try {
        const session = await authApi.oauthComplete(ticket);
        setSession(session);
        toast.success(t("signedIn"));
        const returnTo = sessionStorage.getItem("KENBA-oauth-return") ?? `/${locale}`;
        sessionStorage.removeItem("KENBA-oauth-return");
        router.replace(returnTo.startsWith("/") ? returnTo : `/${locale}`);
      } catch {
        setStatus("error");
        toast.error(t("oauthError"));
        router.replace(`/${locale}`);
      }
    })();
  }, [locale, params, router, setSession, t]);

  return (
    <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3 px-4 text-center">
      <p className="text-sm text-muted-foreground">
        {status === "loading" ? t("oauthCompleting") : t("oauthError")}
      </p>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[40vh] items-center justify-center text-sm text-muted-foreground">
          …
        </div>
      }
    >
      <AuthCallbackInner />
    </Suspense>
  );
}
