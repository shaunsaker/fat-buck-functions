import * as functions from 'firebase-functions';
import { TransactionData, TransactionType } from './models';
import { processDeposit } from './processDeposit';

// TODO: before we actually set these amounts, we should run an audit to make sure all transactions are accounted for in the pool balance
export const onCreateTransaction = functions.firestore
  .document('transactions/{transactionId}')
  .onCreate(async (snap, context) => {
    const data = snap.data() as TransactionData;
    const { transactionId } = context.params;

    if (data.type === TransactionType.DEPOSIT) {
      await processDeposit(transactionId, data);
    }
  });
