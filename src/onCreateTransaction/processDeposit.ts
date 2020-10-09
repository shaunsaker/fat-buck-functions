import { admin } from '../admin';
import { getDate } from '../utils/getDate';
import { toBTCDigits } from '../utils/toBTCDigits';
import { deductCommission } from './deductCommission';
import {
  CommissionTransactionData,
  DepositTransactionData,
  PoolBalanceData,
  TransactionData,
  TransactionType,
  UserData,
} from './models';

export const handleDeposit = async ({
  transactionId,
  data,
  date,
  onSaveCommission,
  currentUserBalance,
  onUpdateUserBalance,
  currentPoolBalance,
  onUpdatePoolBalance,
}: {
  data: DepositTransactionData;
  transactionId: string;
  date: string;
  onSaveCommission: (commissionData: CommissionTransactionData) => void;
  currentUserBalance: number;
  onUpdateUserBalance: (uid: string, userData: UserData) => void;
  currentPoolBalance: number;
  onUpdatePoolBalance: (poolBalanceData: PoolBalanceData) => void;
}): Promise<null> => {
  const { amount, uid } = data;
  const { newAmount, commission } = deductCommission(amount);

  // save the commission as a new transaction
  const commissionData: CommissionTransactionData = {
    date,
    amount: commission,
    type: TransactionType.COMMISSION,
    depositId: transactionId,
    uid,
  };

  await onSaveCommission(commissionData);

  // update the user's balance
  const newUserBalance = toBTCDigits(currentUserBalance + newAmount);
  const userData: UserData = {
    balance: newUserBalance,
    balanceLastUpdated: date,
  };

  await onUpdateUserBalance(data.uid, userData);

  // update the admin balance
  const newPoolBalance = currentPoolBalance + commission;
  const poolBalanceData: PoolBalanceData = {
    amount: newPoolBalance,
    lastUpdated: date,
  };

  await onUpdatePoolBalance(poolBalanceData);

  return null;
};

export const getCurrentUserBalance = async (uid: string): Promise<number> => {
  const initialUserBalance = toBTCDigits(0);
  const { balance: currentUserBalance = initialUserBalance } = (await (
    await admin.firestore().collection('users').doc(uid).get()
  ).data()) as UserData;

  return currentUserBalance;
};

export const getCurrentPoolBalance = async (): Promise<number> => {
  const { amount: currentPoolBalance } = (await (
    await admin.firestore().collection('pool').doc('balance').get()
  ).data()) as PoolBalanceData;

  return currentPoolBalance;
};

export const saveCommission = async (
  commissionData: CommissionTransactionData,
): Promise<null> => {
  console.log('Saving commission transaction.');
  await admin.firestore().collection('transactions').doc().set(commissionData);

  return null;
};

export const updateUserBalance = async (
  uid: string,
  userData: UserData,
): Promise<null> => {
  console.log('Updating user balance.');
  await admin.firestore().collection('users').doc(uid).update(userData);

  return null;
};

export const updatePoolBalance = async (
  poolBalanceData: PoolBalanceData,
): Promise<null> => {
  console.log('Updating pool balance.');
  await admin
    .firestore()
    .collection('pool')
    .doc('balance')
    .update(poolBalanceData);

  return null;
};

export const processDeposit = async (
  transactionId: string,
  data: TransactionData,
): Promise<null> => {
  const date = getDate();
  const currentUserBalance = await getCurrentUserBalance(data.uid);
  const currentPoolBalance = await getCurrentPoolBalance();

  await handleDeposit({
    transactionId,
    data: data as DepositTransactionData,
    date,
    onSaveCommission: saveCommission,
    currentUserBalance,
    onUpdateUserBalance: updateUserBalance,
    currentPoolBalance,
    onUpdatePoolBalance: updatePoolBalance,
  });

  return null;
};
