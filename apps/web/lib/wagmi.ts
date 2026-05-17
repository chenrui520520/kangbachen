import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { metaMaskWallet, okxWallet } from "@rainbow-me/rainbowkit/wallets";
import { createConfig, http } from "wagmi";
import { injected } from "wagmi/connectors";
import { mainnet, sepolia } from "wagmi/chains";
import { isWalletConnectConfigured } from "./wallet-connect";

const chains = [mainnet, sepolia] as const;

export type WagmiConfigInstance = ReturnType<typeof createConfig> | ReturnType<typeof getDefaultConfig>;

let cached: WagmiConfigInstance | null = null;

/** RainbowKit + WalletConnect — only when a valid Reown project id is set. */
export function isRainbowKitEnabled(): boolean {
  return isWalletConnectConfigured();
}

export function getWagmiConfig(): WagmiConfigInstance {
  if (cached) return cached;

  if (!isWalletConnectConfigured()) {
    cached = createConfig({
      chains: [...chains],
      connectors: [injected({ shimDisconnect: true })],
      transports: {
        [mainnet.id]: http(),
        [sepolia.id]: http(),
      },
      ssr: true,
    });
    return cached;
  }

  const projectId = process.env.NEXT_PUBLIC_WC_PROJECT_ID!.trim();
  cached = getDefaultConfig({
    appName: "KENBA",
    projectId,
    chains: [...chains],
    wallets: [
      {
        groupName: "Recommended",
        wallets: [metaMaskWallet, okxWallet],
      },
    ],
    ssr: true,
  });

  return cached;
}
