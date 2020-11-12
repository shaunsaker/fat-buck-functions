import {
  TransactionData,
  TransactionType,
} from '../../services/firebase/models';
import { getBalanceFromTransactions } from '../../utils/getBalanceFromTransactions';
import { sortArrayOfObjectsByKey } from '../../utils/sortArrayOfObjectsByKey';
import { toBTCDigits } from '../../utils/toBTCDigits';

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
  );

  if (!trades.length) {
    return {
      ratio: 0,
      amount: 0,
    };
  }

  const lastestTradeDate = sortArrayOfObjectsByKey(trades, 'date', true)[0]
    .date;
  const transactionsUntilLatestTradeDate = transactions.filter(
    (transaction) => transaction.date <= lastestTradeDate,
  );
  const poolBalanceAtLatestTradeDate = getBalanceFromTransactions(
    transactionsUntilLatestTradeDate,
  );

  // profit = poolBalance + (withdrawals - deposits)(until date of last trade)
  const totalDeposits = transactionsUntilLatestTradeDate
    .filter((transaction) => transaction.type === TransactionType.DEPOSIT)
    .reduce((total, next) => total + next.amount, 0);
  const totalWithdrawals = transactionsUntilLatestTradeDate
    .filter((transaction) => transaction.type === TransactionType.WITHDRAWAL)
    .reduce((total, next) => total + next.amount, 0);
  const profit = toBTCDigits(
    poolBalanceAtLatestTradeDate + totalWithdrawals - totalDeposits,
  );
  const ratio = toBTCDigits(profit / poolBalanceAtLatestTradeDate);

  return {
    ratio,
    amount: profit,
  };
};
