import { TransactionData, TransactionType } from '../services/firebase/models';

export const getBalanceFromTransactions = (
  transactions: TransactionData[],
  isUserTransactions?: boolean,
): number => {
  const totalDeposits = transactions
    .filter((transaction) => transaction.type === TransactionType.DEPOSIT)
    .reduce((total, next) => total + next.amount, 0);
  const totalWithdrawals = transactions
    .filter((transaction) => transaction.type === TransactionType.WITHDRAWAL)
    .reduce((total, next) => total + next.amount, 0);
  const totalTrades = transactions
    .filter((transaction) => transaction.type === TransactionType.TRADE)
    .reduce((total, next) => total + next.amount, 0);

  // We ignore commission transactions if these are the pools transactions since those are included in the deposit amount
  // but we include them if this is the user's transactions
  let totalCommission = 0;
  if (isUserTransactions) {
    totalCommission = transactions
      .filter((transaction) => transaction.type === TransactionType.COMMISSION)
      .reduce((total, next) => total + next.amount, 0);
  }

  const balance =
    totalDeposits - totalWithdrawals + totalTrades - totalCommission;

  return balance;
};
