import {
  TransactionData,
  TransactionType,
} from '../../services/firebase/models';
import { toBTCDigits } from '../../utils/toBTCDigits';

export const calculateTotalProfit = (
  poolBalance: number,
  transactions: TransactionData[],
): number => {
  if (!poolBalance) {
    return 0;
  }

  if (!transactions.length) {
    return 0;
  }

  // profit = poolBalance + withdrawals - deposits
  const totalDeposits = transactions
    .filter((transaction) => transaction.type === TransactionType.DEPOSIT)
    .reduce((total, next) => total + next.amount, 0);
  const totalWithdrawals = transactions
    .filter((transaction) => transaction.type === TransactionType.WITHDRAWAL)
    .reduce((total, next) => total + next.amount, 0);
  const profit = toBTCDigits(poolBalance + totalWithdrawals - totalDeposits);
  const profitRatio = toBTCDigits(profit / poolBalance);

  return profitRatio;
};
