import { getDate } from '../../utils/getDate';
import {
  PoolProfitData,
  TradeTransactionData,
  UserData,
  UserTradeTransactionData,
} from '../../services/firebase/models';
import { getTransactions } from '../../services/firebase/getTransactions';
import { savePoolProfit } from '../../services/firebase/savePoolProfit';
import { calculateTotalProfit } from './calculateTotalProfit';
import { getUsersWithBalances } from '../../services/firebase/getUsersWithBalances';
import { getPoolBalance } from '../../services/firebase/getPoolBalance';
import { saveUserTransaction } from '../../services/firebase/saveUserTransaction';
import { saveUserData } from '../../services/firebase/saveUserData';

export const handleSavePoolProfit = async ({
  onGetTransactions,
  onSavePoolProfit,
}: {
  onGetTransactions: typeof getTransactions;
  onSavePoolProfit: typeof savePoolProfit;
}): Promise<null> => {
  // get the transactions
  const transactions = await onGetTransactions();

  if (!transactions.length) {
    return null;
  }

  // calculate and save the new profit
  const { ratio, amount } = calculateTotalProfit(transactions);
  const poolProfitData: PoolProfitData = {
    ratio,
    amount,
    lastUpdated: getDate(),
  };

  await onSavePoolProfit(poolProfitData);

  return null;
};

export const calculateUserTradeShare = ({
  tradeAmount,
  userBalance,
  poolBalance,
}: {
  tradeAmount: number;
  userBalance: number;
  poolBalance: number;
}): number => {
  const userRatio = userBalance / poolBalance;
  const userTradeShare = tradeAmount * userRatio;

  return userTradeShare;
};

export const calculateUserBalance = ({
  userTradeShare,
  userBalance,
}: {
  userTradeShare: number;
  userBalance: number;
}): number => {
  const newUserBalance = userBalance + userTradeShare;

  // if the new balance is less than 0, return 0
  return newUserBalance < 0 ? 0 : newUserBalance;
};

export const handleSaveUserTransactions = async ({
  transactionId,
  data,
  onGetPoolBalance,
  onGetUsersWithBalances,
  onSaveUserTransaction,
  onSaveUserData,
}: {
  transactionId: string;
  data: TradeTransactionData;
  onGetPoolBalance: typeof getPoolBalance;
  onGetUsersWithBalances: typeof getUsersWithBalances;
  onSaveUserTransaction: typeof saveUserTransaction;
  onSaveUserData: typeof saveUserData;
}): Promise<null> => {
  // get the pool balance
  const poolBalance = await onGetPoolBalance();

  // get the users with balances
  const usersWithBalances = await onGetUsersWithBalances();

  for (const user of usersWithBalances) {
    // calculate each users proportion of the trade amount
    const userBalance = user.balance;
    const userTradeShare = calculateUserTradeShare({
      tradeAmount: data.amount,
      userBalance,
      poolBalance,
    });
    const newUserBalance = calculateUserBalance({
      userTradeShare,
      userBalance,
    });

    // save the user transaction
    const userTransaction: UserTradeTransactionData = {
      ...data,
      amount: userTradeShare,
      transactionId,
    };
    await onSaveUserTransaction(user.id, userTransaction);

    // update the user's balance
    const userData: UserData = {
      balance: newUserBalance,
      balanceLastUpdated: getDate(),
      id: user.id,
    };
    await onSaveUserData(user.id, userData);
  }

  return null;
};

export const handleTrade = async ({
  transactionId,
  data,
  onSavePoolProfit,
  onSaveUserTransactions,
}: {
  transactionId: string;
  data: TradeTransactionData;
  onSavePoolProfit: typeof handleSavePoolProfit;
  onSaveUserTransactions: typeof handleSaveUserTransactions;
}): Promise<null> => {
  await onSavePoolProfit({
    onGetTransactions: getTransactions,
    onSavePoolProfit: savePoolProfit,
  });

  await onSaveUserTransactions({
    transactionId,
    data,
    onGetPoolBalance: getPoolBalance,
    onGetUsersWithBalances: getUsersWithBalances,
    onSaveUserTransaction: saveUserTransaction,
    onSaveUserData: saveUserData,
  });

  return null;
};

export const processTrade = async (
  transactionId: string,
  data: TradeTransactionData,
): Promise<null> => {
  await handleTrade({
    transactionId,
    data,
    onSavePoolProfit: handleSavePoolProfit,
    onSaveUserTransactions: handleSaveUserTransactions,
  });

  return null;
};
