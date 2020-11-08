import {
  TradeTransactionData,
  TransactionData,
  TransactionType,
} from '../../services/firebase/models';

export const calculateTotalProfit = (
  transactions: TransactionData[],
): number => {
  // returns the avg trade profit ratio
  const trades = transactions.filter(
    (transaction) => transaction.type === TransactionType.TRADE,
  ) as TradeTransactionData[];

  if (!trades.length) {
    return 0;
  }

  const totalProfitRatio =
    trades.reduce((total, next) => total + next.profitRatio, 0) / trades.length;

  return totalProfitRatio;
};