import { getDepositHistory } from '../../services/binance/getDepositHistory';
import { BinanceDepositStatus } from '../../services/binance/models';
import { getDepositCalls } from '../../services/firebase/getDepositCalls';
import {
  DepositStatus,
  DepositTransactionData,
  TransactionType,
} from '../../services/firebase/models';
import { saveDepositCall } from '../../services/firebase/saveDepositCall';
import { saveTransaction } from '../../services/firebase/saveTransaction';
import { getDate } from '../../utils/getDate';

export const processDeposits = async ({
  onGetDepositHistory,
  onGetDepositCalls,
  onSaveTransaction,
  onSaveDepositCall,
}: {
  onGetDepositHistory: typeof getDepositHistory;
  onGetDepositCalls: typeof getDepositCalls;
  onSaveTransaction: typeof saveTransaction;
  onSaveDepositCall: typeof saveDepositCall;
}): Promise<null> => {
  // get the deposit history from binance
  const depositHistory = await onGetDepositHistory();

  // get the deposit calls from firebase
  const depositCalls = await onGetDepositCalls();

  // filter out the deposits in depositHistory that have already been resolved in depositCalls
  const unresolvedDeposits = depositHistory.filter((deposit) =>
    depositCalls.some(
      (depositCall) =>
        depositCall.txId !== deposit.txId ||
        (depositCall.txId === deposit.txId &&
          depositCall.status !== DepositStatus.SUCCESS),
    ),
  );

  // filter out the deposit calls that have already resolved
  const unresolvedDepositCalls = depositCalls.filter(
    (depositCall) => depositCall.status !== DepositStatus.SUCCESS,
  );

  // for any deposits, check if there is an unresolved deposit call that matches the walletAddress
  for (const deposit of unresolvedDeposits) {
    const depositCall = unresolvedDepositCalls.filter(
      (depositCall) => depositCall.walletAddress === deposit.address,
    )[0];

    if (!depositCall) {
      continue;
    }

    const newDepositCallData = { ...depositCall };

    // if the status is not success, add the transaction id
    if (deposit.status !== BinanceDepositStatus.SUCCESS) {
      newDepositCallData.txId = deposit.txId;
    }

    // if the status is success, update the deposit call and add the deposit to transactions
    else if (deposit.status === BinanceDepositStatus.SUCCESS) {
      // check if the asset is BTC, if not don't process it but save it as an error
      if (deposit.asset !== 'BTC') {
        newDepositCallData.status = DepositStatus.ERROR;
        newDepositCallData.message = `We do not support ${deposit.asset} deposits. Your deposit will be returned to your wallet address, ${deposit.address}.`;

        // TODO: automatically withdraw to the user's address
      } else {
        const date = getDate();
        newDepositCallData.resolvedDate = date;
        newDepositCallData.status = DepositStatus.SUCCESS;

        // save the deposit to transactions
        const transaction: DepositTransactionData = {
          uid: depositCall.uid,
          walletAddress: depositCall.walletAddress,
          depositCallId: depositCall.id,
          txId: deposit.txId,
          date,
          amount: deposit.amount,
          type: TransactionType.DEPOSIT,
        };

        await onSaveTransaction(transaction);
      }
    }

    // should not happen
    else {
      throw new Error('Encountered deposit in unknown state.');
    }

    // save the updated deposit call
    await onSaveDepositCall(newDepositCallData, newDepositCallData.id);
  }

  return null;
};

export const handleDeposits = async (): Promise<null> => {
  await processDeposits({
    onGetDepositHistory: getDepositHistory,
    onGetDepositCalls: getDepositCalls,
    onSaveTransaction: saveTransaction,
    onSaveDepositCall: saveDepositCall,
  });

  return null;
};
