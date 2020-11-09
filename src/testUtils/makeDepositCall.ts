import { DepositCallData, DepositStatus } from '../services/firebase/models';
import { getDate } from '../utils/getDate';
import { getUniqueId } from '../utils/getUniqueId';

export const makeDepositCall = (
  walletAddress?: string,
  binanceTransactionId?: string,
  hasSuccess?: boolean,
): DepositCallData => {
  return {
    id: getUniqueId(),
    uid: getUniqueId(),
    date: getDate(),
    walletAddress: walletAddress || getUniqueId(),
    status: hasSuccess ? DepositStatus.SUCCESS : DepositStatus.PENDING,
    binanceTransactionId,
    resolvedDate: hasSuccess ? getDate() : undefined,
  };
};
