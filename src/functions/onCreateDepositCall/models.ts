export interface CallDepositArgs {
  walletAddress: string;
}

export interface CallDepositResponse {
  success?: boolean;
  error?: boolean;
  message?: string;
}
