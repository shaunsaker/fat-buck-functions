export enum BinanceDepositStatus {
  'PENDING' = 0,
  'VERIFYING' = 6,
  'SUCCESS' = 1,
}

export interface BinanceDepositHistory {
  amount: number;
  asset: string;
  txId: string;
  status: BinanceDepositStatus;
  address: string;
  inputAddress?: string; // input address attached later by blockchain lookup
}

export type BinanceDepositList = BinanceDepositHistory[];

export interface BinanceDepositHistoryResponse {
  depositList: BinanceDepositList;
  success: boolean;
}

export enum BinanceWithdrawalStatus {
  'EMAIL_SENT' = 0,
  'CANCELLED' = 1,
  'AWAITING_APPROVAL' = 2,
  'REJECTED' = 3,
  'PROCESSING' = 4,
  'FAILURE' = 5,
  'COMPLETED' = 6,
}

export interface BinanceWithdrawalHistory {
  applyTime: number;
  amount: number;
  transactionFee: number;
  asset: string;
  address: string;
  txId: string;
  status: BinanceWithdrawalStatus;
}

export type BinanceWithdrawalList = BinanceWithdrawalHistory[];

export interface BinanceWithdrawalHistoryResponse {
  withdrawList: BinanceWithdrawalList;
  success: boolean;
}

export const BINANCE_WITHDRAWAL_FEE = 0.0004;
