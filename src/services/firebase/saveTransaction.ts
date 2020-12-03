import { firebase } from '.';
import { TransactionData } from './models';

export const saveTransaction = async (
  transaction: TransactionData,
  transactionId?: string,
): Promise<null> => {
  const ref = firebase.firestore().collection('transactions');

  if (!transactionId) {
    await ref.doc().set(transaction);
  } else {
    await ref.doc(transactionId).set(transaction);
  }

  return null;
};
