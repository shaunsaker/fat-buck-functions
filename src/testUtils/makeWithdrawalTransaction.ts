import {
  TransactionData,
  TransactionType,
  WithdrawalTransactionData,
} from '../services/firebase/models';
import { getBalanceFromTransactions } from '../utils/getBalanceFromTransactions';
import { getDate } from '../utils/getDate';
import { getRandomNumber } from '../utils/getRandomNumber';
import { getUniqueId } from '../utils/getUniqueId';
import { toBTCDigits } from '../utils/toBTCDigits';

export const makeWithdrawalTransaction = (
  existingTransactions: TransactionData[],
): WithdrawalTransactionData => {
  // use the existingTransactions to make sure we don't withdraw more than is available
  const availableBalance = getBalanceFromTransactions(existingTransactions);

  return {
    date: getDate(),
    amount: toBTCDigits(getRandomNumber(0, availableBalance)),
    type: TransactionType.WITHDRAWAL,
    uid: getUniqueId(),
    walletAddress: getUniqueId(),
  };
};
