import { getDate } from '../../utils/getDate';
import {
  PoolProfitData,
  TradeTransactionData,
  TransactionData,
  TransactionType,
} from '../../services/firebase/models';
import { getPoolBalance } from '../../services/firebase/getPoolBalance';
import { getTransactions } from '../../services/firebase/getTransactions';
import { savePoolProfit } from '../../services/firebase/savePoolProfit';

export const handleTrade = async ({
  // transactionId,
  // data,
  date,
  poolBalance,
  transactions,
  onSavePoolProfit,
}: {
  transactionId: string;
  data: TradeTransactionData;
  date: string;
  poolBalance: number;
  transactions: TransactionData[];
  onSavePoolProfit: (poolProfitData: PoolProfitData) => void;
}): Promise<null> => {
  // recalculate our total profit = balance / (deposits + withdrawals)
  const totalDeposits = transactions
    .filter((transaction) => transaction.type === TransactionType.DEPOSIT)
    .reduce((total, next) => total + next.amount, 0);
  const totalWithdrawals = transactions
    .filter((transaction) => transaction.type === TransactionType.WITHDRAWAL)
    .reduce((total, next) => total + next.amount, 0);
  const totalProfit = poolBalance / (totalDeposits + totalWithdrawals); // TODO: test this, I got infinity in the db

  // save the new profit
  const poolProfitData: PoolProfitData = {
    amount: totalProfit,
    lastUpdated: date,
  };
  await onSavePoolProfit(poolProfitData);

  // TODO: share the actual profit/loss amount proportionately between all users and create new transactions appropriately
  // NOTE: we'll need to use a batch here since there will be n * users transactions created for every trade (CFO - not sure if this is the best approach)

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
    onSavePoolProfit: savePoolProfit,
  });

  return null;
};
