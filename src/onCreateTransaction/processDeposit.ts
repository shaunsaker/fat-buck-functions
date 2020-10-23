import { admin } from '../admin';
import { getDate } from '../utils/getDate';
import { toBTCDigits } from '../utils/toBTCDigits';
import { deductCommission } from './deductCommission';
import {
  CommissionTransactionData,
  DepositTransactionData,
  PoolCommissionData,
  TransactionType,
  UserData,
} from './models';

export const handleDeposit = async ({
  transactionId,
  data,
  date,
  onSaveCommission,
  userBalance,
  onUpdateUserBalance,
  poolCommission,
  onUpdatePoolCommission,
}: {
  transactionId: string;
  data: DepositTransactionData;
  date: string;
  onSaveCommission: (commissionData: CommissionTransactionData) => void;
  userBalance: number;
  onUpdateUserBalance: (uid: string, userData: UserData) => void;
  poolCommission: number;
  onUpdatePoolCommission: (poolCommissionData: PoolCommissionData) => void;
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
  const newUserBalance = toBTCDigits(userBalance + newAmount);
  const userData: UserData = {
    balance: newUserBalance,
    balanceLastUpdated: date,
  };

  await onUpdateUserBalance(data.uid, userData);

  // update the pool balance
  const newPoolBalance = poolCommission + commission;
  const poolCommissionData: PoolCommissionData = {
    amount: newPoolBalance,
    lastUpdated: date,
  };

  await onUpdatePoolCommission(poolCommissionData);

  return null;
};

export const getUserBalance = async (uid: string): Promise<number> => {
  const initialUserBalance = toBTCDigits(0);
  const { balance: userBalance = initialUserBalance } = (await (
    await admin.firestore().collection('users').doc(uid).get()
  ).data()) as UserData;

  return userBalance;
};

export const getPoolCommission = async (): Promise<number> => {
  const { amount: poolCommission } = (await (
    await admin.firestore().collection('pool').doc('commission').get()
  ).data()) as PoolCommissionData;

  return poolCommission;
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
  poolCommissionData: PoolCommissionData,
): Promise<null> => {
  console.log('Updating pool commission.');
  await admin
    .firestore()
    .collection('pool')
    .doc('commission')
    .update(poolCommissionData);

  return null;
};

export const processDeposit = async (
  transactionId: string,
  data: DepositTransactionData,
): Promise<null> => {
  const date = getDate();
  const userBalance = await getUserBalance(data.uid);
  const poolCommission = await getPoolCommission();

  await handleDeposit({
    transactionId,
    data,
    date,
    onSaveCommission: saveCommission,
    userBalance,
    onUpdateUserBalance: updateUserBalance,
    poolCommission,
    onUpdatePoolCommission: updatePoolCommission,
  });

  return null;
};
