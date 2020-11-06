import {
  CommissionTransactionData,
  DepositTransactionData,
  TransactionType,
} from '../services/firebase/models';
import { deductCommission } from '../utils/deductCommission';
import { getDate } from '../utils/getDate';
import { getUniqueId } from '../utils/getUniqueId';

export const makeCommissionTransaction = (
  depositTransaction: DepositTransactionData,
): CommissionTransactionData => {
  // calculate the commission from the deposit amount
  const { commission } = deductCommission(depositTransaction.amount);

  return {
    date: getDate(),
    amount: commission,
    type: TransactionType.COMMISSION,
    uid: getUniqueId(),
    depositId: getUniqueId(),
  };
};
