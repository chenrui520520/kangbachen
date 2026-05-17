"use client";

import { useEffect } from "react";
import { Button } from "@kenba/ui";
import { useTranslations } from "next-intl";
import { useConnect } from "wagmi";
import { useWalletAuth } from "@/hooks/use-wallet-auth";
import { useOpenWalletConnectModal } from "@/components/providers/wallet-connect-modal-provider";
import { isRainbowKitEnabled } from "@/lib/wagmi";

type Props = {
  autoConnect?: boolean;
  onAutoConnectHandled?: () => void;
  onSuccess: () => void;
};

export function WalletLoginBlock({ autoConnect, onAutoConnectHandled, onSuccess }: Props) {
  const t = useTranslations("auth");
  const rainbowKit = isRainbowKitEnabled();
  const openConnectModal = useOpenWalletConnectModal();
  const { connect, connectors, isPending: connectPending } = useConnect();
  const { signInWithWallet, pending: signPending, isConnected } = useWalletAuth();

  const pending = connectPending || signPending;

  useEffect(() => {
    if (!autoConnect) return;
    onAutoConnectHandled?.();
    if (isConnected) return;

    if (rainbowKit && openConnectModal) {
      openConnectModal();
      return;
    }

    const injected = connectors[0];
    if (injected) {
      void connect({ connector: injected });
    }
  }, [autoConnect, connect, connectors, isConnected, onAutoConnectHandled, openConnectModal, rainbowKit]);

  async function handleClick() {
    try {
      if (!isConnected) {
        if (rainbowKit && openConnectModal) {
          openConnectModal();
          return;
        }
        const injected = connectors[0];
        if (injected) {
          await connect({ connector: injected });
          return;
        }
        return;
      }
      await signInWithWallet();
      onSuccess();
    } catch {
      // toast in hook
    }
  }

  return (
    <Button
      className="w-full shadow-[0_0_20px_-6px_hsl(var(--primary)/0.6)]"
      onClick={() => void handleClick()}
      disabled={pending}
    >
      {pending ? t("signing") : isConnected ? t("signWithWallet") : t("connectWallet")}
    </Button>
  );
}
