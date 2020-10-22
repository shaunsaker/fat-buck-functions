import { admin } from '../admin';
import { getDate } from '../utils/getDate';
import { toBTCDigits } from '../utils/toBTCDigits';
import { deductCommission } from './deductCommission';
import {
  CommissionTransactionData,
  DepositTransactionData,
  PoolCommissionData,
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
  currentPoolCommission,
  onUpdatePoolCommission,
}: {
  data: DepositTransactionData;
  transactionId: string;
  date: string;
  onSaveCommission: (commissionData: CommissionTransactionData) => void;
  currentUserBalance: number;
  onUpdateUserBalance: (uid: string, userData: UserData) => void;
  currentPoolCommission: number;
  onUpdatePoolCommission: (PoolCommissionData: PoolCommissionData) => void;
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

  // update the pool balance
  const newPoolBalance = currentPoolCommission + commission;
  const PoolCommissionData: PoolCommissionData = {
    amount: newPoolBalance,
    lastUpdated: date,
  };

  await onUpdatePoolCommission(PoolCommissionData);

  return null;
};

export const getCurrentUserBalance = async (uid: string): Promise<number> => {
  const initialUserBalance = toBTCDigits(0);
  const { balance: currentUserBalance = initialUserBalance } = (await (
    await admin.firestore().collection('users').doc(uid).get()
  ).data()) as UserData;

  return currentUserBalance;
};

export const getCurrentPoolCommission = async (): Promise<number> => {
  const { amount: currentPoolCommission } = (await (
    await admin.firestore().collection('pool').doc('commission').get()
  ).data()) as PoolCommissionData;

  return currentPoolCommission;
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

export const updatePoolCommission = async (
  PoolCommissionData: PoolCommissionData,
): Promise<null> => {
  console.log('Updating pool commission.');
  await admin
    .firestore()
    .collection('pool')
    .doc('commission')
    .update(PoolCommissionData);

  return null;
};

export const processDeposit = async (
  transactionId: string,
  data: TransactionData,
): Promise<null> => {
  const date = getDate();
  const currentUserBalance = await getCurrentUserBalance(data.uid);
  const currentPoolCommission = await getCurrentPoolCommission();

  await handleDeposit({
    transactionId,
    data: data as DepositTransactionData,
    date,
    onSaveCommission: saveCommission,
    currentUserBalance,
    onUpdateUserBalance: updateUserBalance,
    currentPoolCommission,
    onUpdatePoolCommission: updatePoolCommission,
  });

  return null;
};
