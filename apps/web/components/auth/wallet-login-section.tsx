"use client";

import { useEffect, useState } from "react";
import { Button } from "@kenba/ui";
import { useTranslations } from "next-intl";
import { useWeb3Gate } from "@/components/providers/web3-gate";
import { useWagmiActive } from "@/components/providers/web3-gate-body";
import { WalletLoginBlock } from "@/components/auth/wallet-login-block";

type Props = {
  onSuccess: () => void;
};

/**
 * Wallet UI with stable hook order in this component.
 * Wagmi hooks run only in WalletLoginBlock after WagmiProvider is active.
 */
export function WalletLoginSection({ onSuccess }: Props) {
  const t = useTranslations("auth");
  const { ensureWeb3 } = useWeb3Gate();
  const wagmiActive = useWagmiActive();
  const [wantConnect, setWantConnect] = useState(false);

  useEffect(() => {
    if (wantConnect && wagmiActive) {
      setWantConnect(false);
    }
  }, [wantConnect, wagmiActive]);

  if (!wagmiActive) {
    return (
      <Button
        className="w-full shadow-[0_0_20px_-6px_hsl(var(--primary)/0.6)]"
        onClick={() => {
          ensureWeb3();
          setWantConnect(true);
        }}
      >
        {t("connectWallet")}
      </Button>
    );
  }

  return (
    <WalletLoginBlock
      autoConnect={wantConnect}
      onAutoConnectHandled={() => setWantConnect(false)}
      onSuccess={onSuccess}
    />
  );
}
