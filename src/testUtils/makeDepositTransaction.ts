import {
  DepositTransactionData,
  TransactionType,
} from '../services/firebase/models';
import { getDate } from '../utils/getDate';
import { getRandomNumber } from '../utils/getRandomNumber';
import { getUniqueId } from '../utils/getUniqueId';
import { toBTCDigits } from '../utils/toBTCDigits';

export const makeDepositTransaction = (
  amount?: number,
): DepositTransactionData => {
  return {
    date: getDate(),
    amount: amount || toBTCDigits(getRandomNumber(0, 0.1)),
    type: TransactionType.DEPOSIT,
    uid: getUniqueId(),
    walletAddress: getUniqueId(),
    depositCallId: getUniqueId(),
    binanceTransactionId: getUniqueId(),
  };
};
