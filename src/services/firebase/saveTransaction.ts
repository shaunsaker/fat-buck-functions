import { firebase } from '.';
import { TransactionData } from './models';

export const saveTransaction = async (
  transaction: TransactionData,
  transactionId?: string,
): Promise<null> => {
  await firebase
    .firestore()
    .collection('transactions')
    .doc(transactionId)
    .set(transaction);

  return null;
};
