import {
  BinanceWithdrawalHistory,
  BinanceWithdrawalStatus,
  BINANCE_WITHDRAWAL_FEE,
} from '../services/binance/models';
import { getRandomNumber } from '../utils/getRandomNumber';
import { getUniqueId } from '../utils/getUniqueId';

export const makeBinanceWithdrawal = ({
  amount,
  walletAddress,
  txId,
  status,
}: {
  amount?: number;
  walletAddress?: string;
  txId?: string;
  status?: BinanceWithdrawalStatus;
}): BinanceWithdrawalHistory => {
  return {
    applyTime: Date.now(),
    amount: amount || getRandomNumber(0.1, 0.001),
    asset: 'BTC',
    address: walletAddress || getUniqueId(),
    txId: txId || getUniqueId(),
    status: status || BinanceWithdrawalStatus.EMAIL_SENT,
    transactionFee: BINANCE_WITHDRAWAL_FEE,
  };
};
