export type AuthWalletAccount = {
  address: string;
  chainId: number;
};

export type AuthUser = {
  id: string;
  email: string | null;
  username: string | null;
  avatarUrl: string | null;
  language: string;
  points: number;
  walletAccounts: AuthWalletAccount[];
};

export type AuthTokens = {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
};

export type AuthSession = AuthTokens & {
  user: AuthUser;
};

export type WalletNonceResponse = {
  nonce: string;
  message: string;
  expiresAt: string;
};

export type ApiSuccess<T> = {
  success: true;
  data: T;
};

export type ApiError = {
  success: false;
  code: number;
  message: string;
  details?: unknown;
};
