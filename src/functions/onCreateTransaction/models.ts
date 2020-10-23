export enum TransactionType {
  DEPOSIT = 'DEPOSIT',
  WITHDRAWAL = 'WITHDRAWAL',
  COMMISSION = 'COMMISSION',
  TRADE = 'TRADE',
}

export interface BaseTransactionData {
  date: string;
  amount: number;
  type: TransactionType;
}

export interface DepositTransactionData extends BaseTransactionData {
  uid: string;
  walletAddress: string;
  depositCallId: string;
  binanceTransactionId: string;
}

export interface CommissionTransactionData extends BaseTransactionData {
  depositId: string;
  uid: string; // used to filter a users own transactions
}

export interface TradeTransactionData extends BaseTransactionData {
  tradeId: string;
}

export type TransactionData =
  | DepositTransactionData
  | CommissionTransactionData
  | TradeTransactionData; // TODO: or withdrawal etc

export interface UserData {
  balance: number;
  balanceLastUpdated: string;
}

export interface PoolCommissionData {
  amount: number;
  lastUpdated: string;
}

export interface PoolBalanceData {
  amount: number;
  lastUpdated: string;
}

export interface PoolProfitData {
  amount: number;
  lastUpdated: string;
}
