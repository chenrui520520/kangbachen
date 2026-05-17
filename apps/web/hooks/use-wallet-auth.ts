"use client";

import { useCallback, useState } from "react";
import { useAccount, useChainId, useDisconnect, useSignMessage } from "wagmi";
import { toast } from "@kenba/ui";
import { authApi } from "@/lib/api-client";
import { useAuthStore } from "@/lib/stores/auth-store";

export function useWalletAuth() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { signMessageAsync } = useSignMessage();
  const { disconnect } = useDisconnect();
  const setSession = useAuthStore((s) => s.setSession);
  const clearSession = useAuthStore((s) => s.clearSession);
  const refreshToken = useAuthStore((s) => s.refreshToken);
  const accessToken = useAuthStore((s) => s.accessToken);
  const [pending, setPending] = useState(false);

  const signInWithWallet = useCallback(async () => {
    if (!isConnected || !address) {
      throw new Error("WALLET_NOT_CONNECTED");
    }
    setPending(true);
    try {
      const { message } = await authApi.walletNonce(address, chainId);
      const signature = await signMessageAsync({ message });
      const session = await authApi.walletLogin(address, chainId, signature);
      setSession(session);
      toast.success("Signed in with wallet");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Wallet sign-in failed";
      toast.error(msg);
      throw err;
    } finally {
      setPending(false);
    }
  }, [address, chainId, isConnected, setSession, signMessageAsync]);

  const signOut = useCallback(async () => {
    try {
      if (refreshToken || accessToken) {
        await authApi.logout(refreshToken, accessToken);
      }
    } catch {
      // ignore logout API errors locally
    }
    clearSession();
    disconnect();
  }, [accessToken, clearSession, disconnect, refreshToken]);

  return {
    address,
    isConnected,
    chainId,
    pending,
    signInWithWallet,
    signOut,
  };
}
