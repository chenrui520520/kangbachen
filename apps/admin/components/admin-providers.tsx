"use client";

import type { ReactNode } from "react";
import { GlobalToastProvider, ThemeProvider } from "@kangba/ui";

export function AdminProviders({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <GlobalToastProvider>{children}</GlobalToastProvider>
    </ThemeProvider>
  );
}
