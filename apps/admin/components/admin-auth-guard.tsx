"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { adminAuthStore } from "@/lib/admin-auth-store";

export function AdminAuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const isLogin = pathname === "/login" || pathname?.endsWith("/login");
    if (!isLogin && !adminAuthStore.getToken()) {
      router.replace("/login");
      return;
    }
    setReady(true);
  }, [pathname, router]);

  if (!ready) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-sm text-muted-foreground">加载中…</div>
    );
  }

  return <>{children}</>;
}
