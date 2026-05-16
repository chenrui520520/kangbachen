/**
 * Placeholder for SIWE / typed-data verification.
 * Prefer server-side checks in Fastify with shared secrets — do not trust the client alone.
 */
export function verifyWalletSignatureStub(): never {
  throw new Error("Wallet signature verification is not implemented yet.");
}
