"use client";

import type { ReactNode } from "react";
import {
  GlobalToastProvider,
  MotionProvider,
  ThemeProvider,
  TooltipProvider,
} from "@kenba/ui";
import { AuthProvider } from "@/components/auth/auth-provider";
import { AudioProvider } from "@/components/audio/audio-provider";
import { SmoothScrollProvider } from "@/components/providers/smooth-scroll-provider";
import { PageTransitionProvider } from "@/components/providers/page-transition-provider";
import { QueryProvider } from "@/components/providers/query-provider";
import { Web3GateShell } from "@/components/providers/web3-gate-shell";
import { LoadingScreen } from "@/components/fx/loading-screen";
import { CursorTrail } from "@/components/fx/cursor-trail";
import { AnalyticsTracker } from "@/components/analytics/analytics-tracker";

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <MotionProvider>
        <TooltipProvider delayDuration={200}>
          <QueryProvider>
            <Web3GateShell>
              <AuthProvider>
              <AudioProvider>
                <SmoothScrollProvider>
                  <LoadingScreen />
                  <CursorTrail />
                  <AnalyticsTracker />
                  <GlobalToastProvider>
                    <PageTransitionProvider>{children}</PageTransitionProvider>
                  </GlobalToastProvider>
                </SmoothScrollProvider>
              </AudioProvider>
              </AuthProvider>
            </Web3GateShell>
          </QueryProvider>
        </TooltipProvider>
      </MotionProvider>
    </ThemeProvider>
  );
}
