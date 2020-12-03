import {
  BinanceDepositHistory,
  BinanceDepositStatus,
} from '../services/binance/models';

export const makeBinanceDeposit = (
  walletAddress: string,
  txId: string,
  status?: BinanceDepositStatus,
  asset?: string,
): BinanceDepositHistory => {
  return {
    amount: 1,
    asset: asset || 'BTC',
    address: walletAddress,
    txId: txId,
    status: status || BinanceDepositStatus.PENDING,
  };
};
