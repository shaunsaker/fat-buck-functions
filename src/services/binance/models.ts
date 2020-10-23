export enum BinanceDepositStatus {
  'pending' = 0,
  'verifying' = 6,
  'success' = 1,
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
  depositList: BinanceDepositList;
  success: boolean;
}
