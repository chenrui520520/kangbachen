"use client";

import { useState } from "react";
import { Button, type ButtonProps } from "@kangba/ui";
import { useTranslations } from "next-intl";
import { useIsAuthenticated } from "@/lib/stores/auth-store";
import { LoginModal } from "./login-modal";
import { UserMenu } from "./user-menu";

export function LoginTriggerButton({ className, ...props }: ButtonProps) {
  const t = useTranslations("auth");
  const isAuthenticated = useIsAuthenticated();
  const [open, setOpen] = useState(false);

  if (isAuthenticated) {
    return <UserMenu />;
  }

  return (
    <>
      <Button className={className} onClick={() => setOpen(true)} {...props}>
        {t("signIn")}
      </Button>
      <LoginModal open={open} onOpenChange={setOpen} />
    </>
  );
}
