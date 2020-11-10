import { getPoolBalance } from '../../services/firebase/getPoolBalance';
import { getUserBalance } from '../../services/firebase/getUserBalance';
import {
  PoolBalanceData,
  UserData,
  WithdrawalTransactionData,
} from '../../services/firebase/models';
import { savePoolBalance } from '../../services/firebase/savePoolBalance';
import { saveUserData } from '../../services/firebase/saveUserData';
import { getDate } from '../../utils/getDate';

export const handleUpdatePoolBalance = async ({
  data,
  onGetPoolBalance,
  onSavePoolBalance,
}: {
  data: WithdrawalTransactionData;
  onGetPoolBalance: typeof getPoolBalance;
  onSavePoolBalance: typeof savePoolBalance;
}): Promise<null> => {
  // get the current pool balance
  const poolBalance = await onGetPoolBalance();

  // subtract the withdrawal amount from the pool balance
  const newPoolBalance = poolBalance - data.amount;

  // save the updated pool balance
  const poolBalanceData: PoolBalanceData = {
    amount: newPoolBalance,
    lastUpdated: getDate(),
  };
  await onSavePoolBalance(poolBalanceData);

  return null;
};

export const handleUpdateUserBalance = async ({
  data,
  onGetUserBalance,
  onSaveUserData,
}: {
  data: WithdrawalTransactionData;
  onGetUserBalance: typeof getUserBalance;
  onSaveUserData: typeof saveUserData;
}): Promise<null> => {
  // get the current user balance
  const { uid } = data;
  const userBalance = await onGetUserBalance(uid);

  // subtract the withdrawal amount from the user balance
  // CFO: we don't include the transaction fee and resolved amount, should we save two transactions to include these instead?
  const newUserBalance = userBalance - data.amount;

  // save the updated user balance
  const userData: UserData = {
    balance: newUserBalance,
    balanceLastUpdated: getDate(),
    id: uid,
  };
  await onSaveUserData(uid, userData);

  return null;
};

export const handleWithdrawal = async ({
  data,
  onUpdatePoolBalance,
  onUpdateUserBalance,
}: {
  data: WithdrawalTransactionData;
  onUpdatePoolBalance: typeof handleUpdatePoolBalance;
  onUpdateUserBalance: typeof handleUpdateUserBalance;
}): Promise<null> => {
  // update the pool balance
  await onUpdatePoolBalance({
    data,
    onGetPoolBalance: getPoolBalance,
    onSavePoolBalance: savePoolBalance,
  });

  // update the user balance
  await onUpdateUserBalance({
    data,
    onGetUserBalance: getUserBalance,
    onSaveUserData: saveUserData,
  });

  return null;
};

export const processWithdrawal = async (
  data: WithdrawalTransactionData,
): Promise<null> => {
  await handleWithdrawal({
    data,
    onUpdatePoolBalance: handleUpdatePoolBalance,
    onUpdateUserBalance: handleUpdateUserBalance,
  });

  return null;
};
