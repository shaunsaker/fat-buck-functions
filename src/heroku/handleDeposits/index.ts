import { getDepositHistory } from '../../services/binance/getDepositHistory';
import { BinanceDepositStatus } from '../../services/binance/models';
import { getTxInputWalletAddress } from '../../services/blockCypher/getTxInputWalletAddress';
import { getDepositCalls } from '../../services/firebase/getDepositCalls';
import {
  DepositStatus,
  DepositTransactionData,
  MessagingTopics,
  TransactionType,
} from '../../services/firebase/models';
import { saveDepositCall } from '../../services/firebase/saveDepositCall';
import { saveTransaction } from '../../services/firebase/saveTransaction';
import { sendNotification } from '../../services/firebase/sendNotification';
import { getDate } from '../../utils/getDate';

export const processDeposits = async ({
  onGetDepositHistory,
  onGetDepositCalls,
  onGetTxInputWalletAddress,
  onSaveTransaction,
  onSaveDepositCall,
  onSendNotification,
}: {
  onGetDepositHistory: typeof getDepositHistory;
  onGetDepositCalls: typeof getDepositCalls;
  onGetTxInputWalletAddress: typeof getTxInputWalletAddress;
  onSaveTransaction: typeof saveTransaction;
  onSaveDepositCall: typeof saveDepositCall;
  onSendNotification: typeof sendNotification;
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

  // attach the input wallet address to each unresolved deposit
  // so that we can compare it to the deposit call's wallet address below
  for (const unresolvedDeposit of unresolvedDeposits) {
    const inputWalletAddress = await onGetTxInputWalletAddress(
      unresolvedDeposit.txId,
    );
    unresolvedDeposit['inputAddress'] = inputWalletAddress; // at this point is does not yet exist so we create a new field
  }

  // filter out the deposit calls that have already resolved
  const unresolvedDepositCalls = depositCalls.filter(
    (depositCall) => depositCall.status !== DepositStatus.SUCCESS,
  );

  // for any deposits, check if there is an unresolved deposit call that matches the walletAddress
  for (const deposit of unresolvedDeposits) {
    const depositCall = unresolvedDepositCalls.filter(
      (depositCall) => depositCall.walletAddress === deposit.inputAddress,
    )[0];

    if (!depositCall) {
      continue;
    }

    const newDepositCallData = { ...depositCall };

    if (deposit.status !== BinanceDepositStatus.SUCCESS) {
      // attach the txId
      newDepositCallData.txId = deposit.txId;
    }

    // if the status is success, update the deposit call and add the deposit to transactions
    else {
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

        await onSendNotification({
          topic: MessagingTopics.depositSuccess,
          data: transaction,
        });
      }
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
    onGetTxInputWalletAddress: getTxInputWalletAddress,
    onSaveTransaction: saveTransaction,
    onSaveDepositCall: saveDepositCall,
    onSendNotification: sendNotification,
  });

  return null;
};
