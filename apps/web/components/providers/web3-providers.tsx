"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import { RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { WagmiProvider } from "wagmi";
import "@rainbow-me/rainbowkit/styles.css";
import { getWagmiConfig, isRainbowKitEnabled } from "@/lib/wagmi";
import { WalletConnectModalProvider } from "./wallet-connect-modal-provider";

export function Web3Providers({ children }: { children: ReactNode }) {
  const [config] = useState(() => getWagmiConfig());
  const rainbowKit = isRainbowKitEnabled();

  const inner = rainbowKit ? (
    <RainbowKitProvider modalSize="compact">
      <WalletConnectModalProvider>{children}</WalletConnectModalProvider>
    </RainbowKitProvider>
  ) : (
    children
  );

  return (
    <WagmiProvider config={config} reconnectOnMount={false}>
      {inner}
    </WagmiProvider>
  );
}
