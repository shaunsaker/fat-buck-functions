import {
  DepositTransactionData,
  TransactionType,
} from '../services/firebase/models';
import { getDate } from '../utils/getDate';
import { getRandomNumber } from '../utils/getRandomNumber';
import { getUniqueId } from '../utils/getUniqueId';
import { toBTCDigits } from '../utils/toBTCDigits';

export const makeDepositTransaction = ({
  amount,
  date,
}: {
  amount?: number;
  date?: string;
}): DepositTransactionData => {
  return {
    date: date || getDate(),
    amount: amount || toBTCDigits(getRandomNumber(0, 0.1)),
    type: TransactionType.DEPOSIT,
    uid: getUniqueId(),
    walletAddress: getUniqueId(),
    depositCallId: getUniqueId(),
    txId: getUniqueId(),
  };
};
