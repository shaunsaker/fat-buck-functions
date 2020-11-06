import { getDate } from '../../utils/getDate';
import {
  PoolProfitData,
  TradeTransactionData,
  TransactionData,
} from '../../services/firebase/models';
import { getTransactions } from '../../services/firebase/getTransactions';
import { savePoolProfit } from '../../services/firebase/savePoolProfit';
import { calculateTotalProfit } from './calculateTotalProfit';

export const handleTrade = async ({
  // transactionId,
  // data,
  date,
  transactions,
  onSavePoolProfit,
}: {
  transactionId: string;
  data: TradeTransactionData;
  date: string;
  transactions: TransactionData[];
  onSavePoolProfit: (poolProfitData: PoolProfitData) => void;
}): Promise<null> => {
  // calculate and save the new profit
  const totalProfit = calculateTotalProfit(transactions);
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
  const transactions = await getTransactions();

  await handleTrade({
    transactionId,
    data,
    date,
    transactions,
    onSavePoolProfit: savePoolProfit,
  });

  return null;
};
