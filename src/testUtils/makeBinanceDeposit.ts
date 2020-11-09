import {
  BinanceDepositHistory,
  BinanceDepositStatus,
} from '../services/binance/models';

export const makeBinanceDeposit = (
  walletAddress: string,
  binanceTransactionId: string,
  status?: BinanceDepositStatus,
  asset?: string,
): BinanceDepositHistory => {
  return {
    insertTime: Date.now(),
    amount: 1,
    asset: asset || 'BTC',
    address: walletAddress,
    txId: binanceTransactionId,
    status: status || BinanceDepositStatus.PENDING,
  };
};
