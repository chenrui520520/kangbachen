"use client";

import { createContext, useContext, type ReactNode } from "react";
import { Web3Providers } from "./web3-providers";
import { useWeb3Gate } from "./web3-gate";

/** True only when children are wrapped by WagmiProvider (safe to call wagmi hooks). */
const WagmiActiveContext = createContext(false);

export function useWagmiActive() {
  return useContext(WagmiActiveContext);
}

export function Web3GateBody({ children }: { children: ReactNode }) {
  const { web3Ready } = useWeb3Gate();

  if (!web3Ready) {
    return <>{children}</>;
  }

  return (
    <Web3Providers>
      <WagmiActiveContext.Provider value={true}>{children}</WagmiActiveContext.Provider>
    </Web3Providers>
  );
}
