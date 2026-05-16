import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import {
  coinbaseWallet,
  metaMaskWallet,
  okxWallet,
  rainbowWallet,
  walletConnectWallet,
} from "@rainbow-me/rainbowkit/wallets";
import { mainnet, sepolia } from "wagmi/chains";

let cached: ReturnType<typeof getDefaultConfig> | null = null;

export function getWagmiConfig() {
  if (cached) return cached;

  const projectId = process.env.NEXT_PUBLIC_WC_PROJECT_ID;
  if (!projectId) {
    // WalletConnect requires a project id; placeholder avoids crashing the module graph in dev.
    // Replace with a real id from https://cloud.reown.com/ for wallet features.
    console.warn("[KangBa] NEXT_PUBLIC_WC_PROJECT_ID is not set.");
  }

  cached = getDefaultConfig({
    appName: "KangBa",
    projectId: projectId ?? "00000000000000000000000000000000",
    chains: [mainnet, sepolia],
    wallets: [
      {
        groupName: "Recommended",
        wallets: [metaMaskWallet, okxWallet, coinbaseWallet, rainbowWallet, walletConnectWallet],
      },
    ],
    ssr: true,
  });

  return cached;
}
