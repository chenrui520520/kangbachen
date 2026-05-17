/** True when WalletConnect / Reown project id is configured for production use. */
export function isWalletConnectConfigured(): boolean {
  const id = process.env.NEXT_PUBLIC_WC_PROJECT_ID?.trim();
  if (!id || id === "demo") return false;
  if (!/^[a-f0-9]{32}$/i.test(id)) return false;
  if (/^0+$/.test(id)) return false;
  return true;
}
