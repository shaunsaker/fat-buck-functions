import {
  WithdrawalCallData,
  WithdrawalStatus,
} from '../services/firebase/models';
import { getDate } from '../utils/getDate';
import { getRandomNumber } from '../utils/getRandomNumber';
import { getUniqueId } from '../utils/getUniqueId';

export const makeWithdrawalCall = ({
  amount,
  walletAddress,
  binanceTransactionId,
  hasSuccess,
}: {
  amount?: number;
  walletAddress?: string;
  binanceTransactionId?: string;
  hasSuccess?: boolean;
}): WithdrawalCallData => {
  return {
    id: getUniqueId(),
    uid: getUniqueId(),
    date: getDate(),
    amount: amount || getRandomNumber(0.0001, 0.001),
    walletAddress: walletAddress || getUniqueId(),
    status: hasSuccess
      ? WithdrawalStatus.COMPLETED
      : WithdrawalStatus.EMAIL_SENT,
    binanceTransactionId,
    resolvedDate: hasSuccess ? getDate() : undefined,
  };
};
