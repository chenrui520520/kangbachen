import { z } from "zod";

const ethAddress = z
  .string()
  .regex(/^0x[a-fA-F0-9]{40}$/, "Invalid wallet address")
  .transform((v) => v.toLowerCase());

const signature = z.string().regex(/^0x[a-fA-F0-9]+$/, "Invalid signature");

export const walletNonceBodySchema = z.object({
  address: ethAddress,
  chainId: z.coerce.number().int().positive(),
});

export const walletLoginBodySchema = z.object({
  address: ethAddress,
  chainId: z.coerce.number().int().positive(),
  signature,
});

export const emailRequestBodySchema = z.object({
  email: z.string().email().transform((v) => v.toLowerCase().trim()),
});

export const emailVerifyBodySchema = z.object({
  email: z.string().email().transform((v) => v.toLowerCase().trim()),
  code: z.string().length(6).regex(/^\d{6}$/),
});

export const refreshBodySchema = z.object({
  refreshToken: z.string().min(1),
});

export const logoutBodySchema = z.object({
  refreshToken: z.string().min(1).optional(),
});

export const twitterLoginBodySchema = z.object({
  token: z.string().min(1).optional(),
});

export type WalletNonceBody = z.infer<typeof walletNonceBodySchema>;
export type WalletLoginBody = z.infer<typeof walletLoginBodySchema>;
export type EmailRequestBody = z.infer<typeof emailRequestBodySchema>;
export type EmailVerifyBody = z.infer<typeof emailVerifyBodySchema>;
