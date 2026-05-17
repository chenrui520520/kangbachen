"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { useAuthStore } from "@/lib/stores/auth-store";

type Web3GateContextValue = {
  web3Ready: boolean;
  ensureWeb3: () => void;
};

const Web3GateContext = createContext<Web3GateContextValue>({
  web3Ready: false,
  ensureWeb3: () => {},
});

export function useWeb3Gate() {
  return useContext(Web3GateContext);
}

/**
 * Delays Wagmi / WalletConnect init until the user needs a wallet.
 * Prevents "Connection interrupted while trying to subscribe" on every page load.
 */
export function Web3Gate({ children }: { children: ReactNode }) {
  const [web3Ready, setWeb3Ready] = useState(false);
  const hydrated = useAuthStore((s) => s.hydrated);
  const user = useAuthStore((s) => s.user);

  const ensureWeb3 = useCallback(() => {
    setWeb3Ready(true);
  }, []);

  useEffect(() => {
    if (hydrated && user && user.walletAccounts.length > 0) {
      setWeb3Ready(true);
    }
  }, [hydrated, user]);

  return (
    <Web3GateContext.Provider value={{ web3Ready, ensureWeb3 }}>{children}</Web3GateContext.Provider>
  );
}
