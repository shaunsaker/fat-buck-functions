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
import { saveUserTransaction } from '../../services/firebase/saveUserTransaction';
import { saveUserData } from '../../services/firebase/saveUserData';
import { savePoolCommission } from '../../services/firebase/savePoolCommission';
import { deductCommission } from '../../utils/deductCommission';

export const handleDeposit = async ({
  transactionId,
  data,
  currentUserBalance,
  currentPoolCommission,
  onSaveCommissionTransaction,
  onSaveUserTransaction,
  onUpdateUserBalance,
  onUpdatePoolCommission,
}: {
  transactionId: string;
  data: DepositTransactionData;
  currentUserBalance: number;
  currentPoolCommission: number;
  onSaveCommissionTransaction: typeof saveCommissionTransaction;
  onSaveUserTransaction: typeof saveUserTransaction;
  onUpdateUserBalance: typeof saveUserData;
  onUpdatePoolCommission: typeof savePoolCommission;
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
  await onSaveUserTransaction(uid, commissionData);

  // save the deposit transaction data to the user's transactions
  await onSaveUserTransaction(uid, data);

  // update the user's balance
  const newUserBalance = toBTCDigits(currentUserBalance + newAmount);
  const userData: UserData = {
    balance: newUserBalance,
    balanceLastUpdated: date,
    id: uid,
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
    onSaveUserTransaction: saveUserTransaction,
    onUpdateUserBalance: saveUserData,
    onUpdatePoolCommission: savePoolCommission,
  });

  return null;
};
