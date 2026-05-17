"use client";

import { useState } from "react";
import { Button } from "@kenba/ui";
import { useTranslations } from "next-intl";
import { useIsAuthenticated } from "@/lib/stores/auth-store";
import { LoginModal } from "./login-modal";
import { UserMenu } from "./user-menu";

export function AuthHeaderActions() {
  const t = useTranslations("auth");
  const isAuthenticated = useIsAuthenticated();
  const [loginOpen, setLoginOpen] = useState(false);

  return (
    <>
      {isAuthenticated ? (
        <UserMenu />
      ) : (
        <Button
          size="sm"
          className="shadow-[0_0_20px_-6px_hsl(var(--primary)/0.6)]"
          onClick={() => setLoginOpen(true)}
        >
          {t("signIn")}
        </Button>
      )}
      <LoginModal open={loginOpen} onOpenChange={setLoginOpen} />
    </>
  );
}
