export enum BinanceDepositStatus {
  'PENDING' = 0,
  'VERIFYING' = 6,
  'SUCCESS' = 1,
}

export interface BinanceDepositHistory {
  insertTime: number;
  amount: number;
  asset: string;
  address: string;
  txId: string;
  status: BinanceDepositStatus;
}

export type BinanceDepositList = BinanceDepositHistory[];

export interface BinanceDepositHistoryResponse {
  data: BinanceDepositList;
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
  status: BinanceDepositStatus;
}

export type BinanceWithdrawalList = BinanceWithdrawalHistory[];

export interface BinanceWithdrawalHistoryResponse {
  data: BinanceWithdrawalList;
  success: boolean;
}
