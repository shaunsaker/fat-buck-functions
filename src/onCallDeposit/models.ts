export enum DepositStatus {
  PENDING = "PENDING",
  SUCCESS = "SUCCESS",
}

export interface DepositData {
  uid: string;
  date: string;
  walletAddress: string;
  status: DepositStatus;
  binanceTransactionId?: string; // added once it has been seen in deposit history
  resolvedDate?: string; // added once it has resolved (status is SUCCESS)
  message?: string; // used for errors
}

export interface OnCallDepositResponse {
  success?: boolean;
  error?: boolean;
  message?: string;
}
