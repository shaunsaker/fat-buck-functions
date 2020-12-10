import {
  TradeTransactionData,
  TransactionData,
  TransactionType,
} from '../../services/firebase/models';

export const calculateTotalProfit = (
  transactions: TransactionData[],
): {
  ratio: number;
  amount: number;
} => {
  if (!transactions.length) {
    return {
      ratio: 0,
      amount: 0,
    };
  }

  const trades = transactions.filter(
    (transaction) => transaction.type === TransactionType.TRADE,
  ) as TradeTransactionData[];

  if (!trades.length) {
    return {
      ratio: 0,
      amount: 0,
    };
  }

  const ratioSum = trades.reduce(
    (total, next) => (total += next.profitRatio),
    0,
  );
  const ratio = ratioSum / trades.length;
  const profit = trades.reduce((total, next) => (total += next.amount), 0);

  return {
    ratio,
    amount: profit,
  };
};
