"use client";

import { createContext, useContext, type ReactNode } from "react";
import { useConnectModal } from "@rainbow-me/rainbowkit";

type OpenFn = (() => void) | undefined;

const WalletConnectModalContext = createContext<OpenFn>(undefined);

export function WalletConnectModalProvider({ children }: { children: ReactNode }) {
  const { openConnectModal } = useConnectModal();
  return (
    <WalletConnectModalContext.Provider value={openConnectModal}>{children}</WalletConnectModalContext.Provider>
  );
}

export function useOpenWalletConnectModal(): OpenFn {
  return useContext(WalletConnectModalContext);
}
