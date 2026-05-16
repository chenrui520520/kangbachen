"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { WagmiProvider } from "wagmi";
import "@rainbow-me/rainbowkit/styles.css";
import {
  GlobalToastProvider,
  MotionProvider,
  ThemeProvider,
  TooltipProvider,
} from "@kangba/ui";
import { AuthProvider } from "@/components/auth/auth-provider";
import { AudioProvider } from "@/components/audio/audio-provider";
import { SmoothScrollProvider } from "@/components/providers/smooth-scroll-provider";
import { PageTransitionProvider } from "@/components/providers/page-transition-provider";
import { LoadingScreen } from "@/components/fx/loading-screen";
import { CursorTrail } from "@/components/fx/cursor-trail";
import { AnalyticsTracker } from "@/components/analytics/analytics-tracker";
import { getWagmiConfig } from "@/lib/wagmi";

export function AppProviders({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());
  const [config] = useState(() => getWagmiConfig());

  return (
    <ThemeProvider>
      <MotionProvider>
        <TooltipProvider delayDuration={200}>
          <WagmiProvider config={config}>
            <QueryClientProvider client={queryClient}>
              <RainbowKitProvider>
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
              </RainbowKitProvider>
            </QueryClientProvider>
          </WagmiProvider>
        </TooltipProvider>
      </MotionProvider>
    </ThemeProvider>
  );
}
