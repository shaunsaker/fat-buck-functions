import { getWithdrawalHistory } from '../../services/binance/getWithdrawalHistory';
import { BinanceWithdrawalStatus } from '../../services/binance/models';
import { getWithdrawalCalls } from '../../services/firebase/getWithdrawalCalls';
import {
  WithdrawalStatus,
  WithdrawalTransactionData,
  TransactionType,
} from '../../services/firebase/models';
import { saveWithdrawalCall } from '../../services/firebase/saveWithdrawalCall';
import { saveTransaction } from '../../services/firebase/saveTransaction';
import { getDate } from '../../utils/getDate';

export const processWithdrawals = async ({
  onGetWithdrawalHistory,
  onGetWithdrawalCalls,
  onSaveTransaction,
  onSaveWithdrawalCall,
}: {
  onGetWithdrawalHistory: typeof getWithdrawalHistory;
  onGetWithdrawalCalls: typeof getWithdrawalCalls;
  onSaveTransaction: typeof saveTransaction;
  onSaveWithdrawalCall: typeof saveWithdrawalCall;
}): Promise<null> => {
  // get the withdrawal history from binance
  const withdrawalHistory = await onGetWithdrawalHistory();

  // get the withdrawal calls from firebase
  const withdrawalCalls = await onGetWithdrawalCalls();

  // filter out the withdrawals in withdrawalHistory that have already been resolved in withdrawalCalls
  const unresolvedWithdrawals = withdrawalHistory.filter((withdrawal) =>
    withdrawalCalls.some(
      (withdrawalCall) =>
        withdrawalCall.txId !== withdrawal.txId ||
        (withdrawalCall.txId === withdrawal.txId &&
          withdrawalCall.status !== WithdrawalStatus.COMPLETED),
    ),
  );

  // filter out the withdrawal calls that have already resolved
  const unresolvedWithdrawalCalls = withdrawalCalls.filter(
    (withdrawalCall) => withdrawalCall.status !== WithdrawalStatus.COMPLETED,
  );

  // for any withdrawals, check if there is an unresolved withdrawal call that matches the walletAddress
  // CFO: do we need to know the amount? We can't compare directly because of the tx fee
  for (const withdrawal of unresolvedWithdrawals) {
    const withdrawalCall = unresolvedWithdrawalCalls.filter(
      (withdrawalCall) => withdrawalCall.walletAddress === withdrawal.address,
    )[0];

    if (!withdrawalCall) {
      continue;
    }

    const newWithdrawalCallData = { ...withdrawalCall };

    // if the status is not completed, add the txId
    if (withdrawal.status !== BinanceWithdrawalStatus.COMPLETED) {
      newWithdrawalCallData.txId = withdrawal.txId;
    }

    // if the status is completed, update the withdrawal call and add the withdrawal to transactions
    else if (withdrawal.status === BinanceWithdrawalStatus.COMPLETED) {
      const date = getDate();
      newWithdrawalCallData.resolvedDate = date;
      newWithdrawalCallData.status = WithdrawalStatus.COMPLETED;

      // save the withdrawal to transactions
      const transaction: WithdrawalTransactionData = {
        uid: withdrawalCall.uid,
        walletAddress: withdrawalCall.walletAddress,
        withdrawalCallId: withdrawalCall.id,
        txId: withdrawal.txId,
        date,
        amount: withdrawalCall.amount,
        transactionFee: withdrawal.transactionFee,
        resolvedAmount: withdrawal.amount,
        type: TransactionType.WITHDRAWAL,
      };

      await onSaveTransaction(transaction);
    }

    // should not happen
    else {
      throw new Error('Encountered withdrawal in unknown state.');
    }

    // save the updated withdrawal call
    await onSaveWithdrawalCall(newWithdrawalCallData, newWithdrawalCallData.id);
  }

  return null;
};

export const handleWithdrawals = async (): Promise<null> => {
  await processWithdrawals({
    onGetWithdrawalHistory: getWithdrawalHistory,
    onGetWithdrawalCalls: getWithdrawalCalls,
    onSaveTransaction: saveTransaction,
    onSaveWithdrawalCall: saveWithdrawalCall,
  });

  return null;
};
