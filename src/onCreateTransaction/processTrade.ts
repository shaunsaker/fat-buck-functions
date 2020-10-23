import { admin } from '../admin';
import { getDate } from '../utils/getDate';
import {
  PoolBalanceData,
  PoolProfitData,
  TradeTransactionData,
  TransactionData,
  TransactionType,
} from './models';

export const handleTrade = async ({
  transactionId,
  data,
  date,
  poolBalance,
  transactions,
  onUpdatePoolProfit,
}: {
  transactionId: string;
  data: TradeTransactionData;
  date: string;
  poolBalance: number;
  transactions: TransactionData[];
  onUpdatePoolProfit: (poolProfitData: PoolProfitData) => void;
}): Promise<null> => {
  // recalculate our total profit = balance / (deposits + withdrawals)
  const totalDeposits = transactions
    .filter((transaction) => transaction.type === TransactionType.DEPOSIT)
    .reduce((total, next) => total + next.amount, 0);
  const totalWithdrawals = transactions
    .filter((transaction) => transaction.type === TransactionType.WITHDRAWAL)
    .reduce((total, next) => total + next.amount, 0);
  const totalProfit = poolBalance / (totalDeposits + totalWithdrawals);

  // save the new profit
  const poolProfitData: PoolProfitData = {
    amount: totalProfit,
    lastUpdated: date,
  };
  await onUpdatePoolProfit(poolProfitData);

  // TODO: share the actual profit/loss amount proportionately between all users and create new transactions appropriately
  // NOTE: we'll need to use a batch here since there will be n * users transactions created for every trade (CFO - not sure if this is the best approach)

  return null;
};

export const getPoolBalance = async (): Promise<number> => {
  const { amount: poolBalance } = (await (
    await admin.firestore().collection('pool').doc('balance').get()
  ).data()) as PoolBalanceData;

  return poolBalance;
};

export const getTransactions = async (): Promise<TransactionData[]> => {
  return (await admin.firestore().collection('transactions').get()).docs.map(
    (doc) => {
      return {
        ...(doc.data() as TransactionData),
        id: doc.id,
      };
    },
  );
};

export const updatePoolProfit = async (
  poolProfitData: PoolProfitData,
): Promise<null> => {
  console.log('Updating pool profit.');
  await admin
    .firestore()
    .collection('pool')
    .doc('profit')
    .update(poolProfitData);

  return null;
};
export const processTrade = async (
  transactionId: string,
  data: TradeTransactionData,
): Promise<null> => {
  const date = getDate();
  const poolBalance = await getPoolBalance();
  const transactions = await getTransactions();

  await handleTrade({
    transactionId,
    data,
    date,
    poolBalance,
    transactions,
    onUpdatePoolProfit: updatePoolProfit,
  });

  return null;
};
