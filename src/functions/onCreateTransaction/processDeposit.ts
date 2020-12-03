import { getDate } from '../../utils/getDate';
import { toBTCDigits } from '../../utils/toBTCDigits';
import {
  CommissionTransactionData,
  DepositTransactionData,
  PoolCommissionData,
  TransactionType,
  UserData,
} from '../../services/firebase/models';
import { getPoolCommission } from '../../services/firebase/getPoolCommission';
import { saveCommissionTransaction } from '../../services/firebase/saveCommissionTransaction';
import { saveUserTransaction } from '../../services/firebase/saveUserTransaction';
import { saveUserData } from '../../services/firebase/saveUserData';
import { savePoolCommission } from '../../services/firebase/savePoolCommission';
import { deductCommission } from '../../utils/deductCommission';
import { getUserData } from '../../services/firebase/getUserData';

export const handleDeposit = async ({
  transactionId,
  data,
  currentUserBalance,
  isUserAdmin,
  currentPoolCommission,
  onSaveCommissionTransaction,
  onSaveUserTransaction,
  onUpdateUserBalance,
  onUpdatePoolCommission,
}: {
  transactionId: string;
  data: DepositTransactionData;
  currentUserBalance: number;
  isUserAdmin: boolean;
  currentPoolCommission: number;
  onSaveCommissionTransaction: typeof saveCommissionTransaction;
  onSaveUserTransaction: typeof saveUserTransaction;
  onUpdateUserBalance: typeof saveUserData;
  onUpdatePoolCommission: typeof savePoolCommission;
}): Promise<null> => {
  // calculate the deducted commission
  const { amount, uid } = data;
  const date = getDate();
  let amountToUse = amount;

  if (!isUserAdmin) {
    const { newAmount, commission } = deductCommission(amount);
    amountToUse = newAmount;

    // save the commission as a new transaction
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

    // update the pool balance
    const newPoolBalance = currentPoolCommission + commission;
    const poolCommissionData: PoolCommissionData = {
      amount: newPoolBalance,
      lastUpdated: date,
    };
    await onUpdatePoolCommission(poolCommissionData);
  }

  // save the deposit transaction data to the user's transactions
  await onSaveUserTransaction(uid, data);

  // update the user's balance
  const newUserBalance = toBTCDigits(currentUserBalance + amountToUse);
  const userData: Partial<UserData> = {
    balance: newUserBalance,
    balanceLastUpdated: date,
  };
  await onUpdateUserBalance(data.uid, userData);

  return null;
};

export const processDeposit = async (
  transactionId: string,
  data: DepositTransactionData,
): Promise<null> => {
  const initialUserBalance = toBTCDigits(0);
  const {
    balance: currentUserBalance = initialUserBalance,
    isAdmin: isUserAdmin,
  } = await getUserData(data.uid);
  const currentPoolCommission = await getPoolCommission();

  await handleDeposit({
    transactionId,
    data,
    currentUserBalance,
    isUserAdmin,
    currentPoolCommission,
    onSaveCommissionTransaction: saveCommissionTransaction,
    onSaveUserTransaction: saveUserTransaction,
    onUpdateUserBalance: saveUserData,
    onUpdatePoolCommission: savePoolCommission,
  });

  return null;
};
