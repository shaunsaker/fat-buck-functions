import { getDate } from '../../utils/getDate';
import { toBTCDigits } from '../../utils/toBTCDigits';
import {
  CommissionTransactionData,
  DepositTransactionData,
  PoolCommissionData,
  TransactionType,
  UserData,
} from '../../services/firebase/models';
import { getUserBalance } from '../../services/firebase/getUserBalance';
import { getPoolCommission } from '../../services/firebase/getPoolCommission';
import { saveCommissionTransaction } from '../../services/firebase/saveCommissionTransaction';
import { saveUserCommissionTransaction } from '../../services/firebase/saveUserCommissionTransaction';
import { saveUserDepositTransaction } from '../../services/firebase/saveUserDepositTransaction';
import { saveUserData } from '../../services/firebase/saveUserData';
import { savePoolCommission } from '../../services/firebase/savePoolCommission';
import { deductCommission } from '../../utils/deductCommission';

export const handleDeposit = async ({
  transactionId,
  data,
  currentUserBalance,
  currentPoolCommission,
  onSaveCommissionTransaction,
  onSaveUserCommissionTransaction,
  onSaveUserDepositTransaction,
  onUpdateUserBalance,
  onUpdatePoolCommission,
}: {
  transactionId: string;
  data: DepositTransactionData;
  currentUserBalance: number;
  currentPoolCommission: number;
  onSaveCommissionTransaction: (data: CommissionTransactionData) => void;
  onSaveUserCommissionTransaction: (
    uid: string,
    data: CommissionTransactionData,
  ) => void;
  onSaveUserDepositTransaction: (
    uid: string,
    data: DepositTransactionData,
  ) => void;
  onUpdateUserBalance: (uid: string, data: UserData) => void;
  onUpdatePoolCommission: (data: PoolCommissionData) => void;
}): Promise<null> => {
  // calculate the deducted commission
  const { amount, uid } = data;
  const { newAmount, commission } = deductCommission(amount);

  // save the commission as a new transaction
  const date = getDate();
  const commissionData: CommissionTransactionData = {
    date,
    amount: commission,
    type: TransactionType.COMMISSION,
    depositId: transactionId,
    uid,
  };
  await onSaveCommissionTransaction(commissionData);

  // save the same commission transaction to the user's transactions
  await onSaveUserCommissionTransaction(uid, commissionData);

  // save the deposit transaction data to the user's transactions
  await onSaveUserDepositTransaction(uid, data);

  // update the user's balance
  const newUserBalance = toBTCDigits(currentUserBalance + newAmount);
  const userData: UserData = {
    balance: newUserBalance,
    balanceLastUpdated: date,
  };
  await onUpdateUserBalance(data.uid, userData);

  // update the pool balance
  const newPoolBalance = currentPoolCommission + commission;
  const poolCommissionData: PoolCommissionData = {
    amount: newPoolBalance,
    lastUpdated: date,
  };
  await onUpdatePoolCommission(poolCommissionData);

  return null;
};

export const processDeposit = async (
  transactionId: string,
  data: DepositTransactionData,
): Promise<null> => {
  const currentUserBalance = await getUserBalance(data.uid);
  const currentPoolCommission = await getPoolCommission();

  await handleDeposit({
    transactionId,
    data,
    currentUserBalance,
    currentPoolCommission,
    onSaveCommissionTransaction: saveCommissionTransaction,
    onSaveUserCommissionTransaction: saveUserCommissionTransaction,
    onSaveUserDepositTransaction: saveUserDepositTransaction,
    onUpdateUserBalance: saveUserData,
    onUpdatePoolCommission: savePoolCommission,
  });

  return null;
};
