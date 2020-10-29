import { getDepositHistory } from '../../services/binance/getDepositHistory';
import {
  BinanceDepositList,
  BinanceDepositStatus,
} from '../../services/binance/models';
import { getDepositCalls } from '../../services/firebase/getDepositCalls';
import {
  DepositCallData,
  DepositStatus,
  DepositTransactionData,
  TransactionType,
} from '../../services/firebase/models';
import { saveDepositCall } from '../../services/firebase/saveDepositCall';
import { saveTransaction } from '../../services/firebase/saveTransaction';
import { getDate } from '../../utils/getDate';

export const processDeposits = async (
  depositHistory: BinanceDepositList,
  depositCalls: DepositCallData[],
  onSaveTransaction: (transaction: DepositTransactionData) => void,
  onSaveDepositCall: (deposit: DepositCallData, id: string) => void,
  date: string,
): Promise<null> => {
  // filter out the deposits in depositHistory that have already been resolved in depositCalls
  const unresolvedDeposits = depositHistory.filter((deposit) =>
    depositCalls.some(
      (depositCall) =>
        depositCall.binanceTransactionId !== deposit.txId ||
        (depositCall.binanceTransactionId === deposit.txId &&
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

    // if the status is pending or verifying, add the binanceTransactionId
    if (
      deposit.status === BinanceDepositStatus.pending ||
      deposit.status === BinanceDepositStatus.verifying
    ) {
      newDepositCallData.binanceTransactionId = deposit.txId;
    }

    // if the status is success, update the deposit call and add the deposit to transactions
    else if (deposit.status === BinanceDepositStatus.success) {
      // check if the asset is BTC, if not don't process it but save it as an error
      if (deposit.asset !== 'BTC') {
        newDepositCallData.status = DepositStatus.ERROR;
        newDepositCallData.message = `We do not support ${deposit.asset} deposits. Your deposit will be returned to your wallet address, ${deposit.address}.`;

        // TODO: withdraw to the user's address
      } else {
        newDepositCallData.resolvedDate = date;
        newDepositCallData.status = DepositStatus.SUCCESS;

        // save the deposit to transactions
        const transaction: DepositTransactionData = {
          uid: depositCall.uid,
          walletAddress: depositCall.walletAddress,
          depositCallId: depositCall.id,
          binanceTransactionId: deposit.txId,
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
  // get the deposit history from binance
  console.log('Getting deposit history.');
  const depositHistory = await getDepositHistory();

  // get the deposit calls from firebase
  console.log('Getting deposit calls.');
  const depositCalls = await getDepositCalls();

  console.log('Processing deposits.');
  await processDeposits(
    depositHistory,
    depositCalls,
    saveTransaction,
    saveDepositCall,
    getDate(),
  );

  return null;
};
