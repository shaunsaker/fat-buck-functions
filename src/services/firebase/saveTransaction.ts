import { firebase } from '.';
import { TransactionData } from './models';

export const saveTransaction = async (
  transaction: TransactionData,
): Promise<null> => {
  await firebase.firestore().collection('transactions').doc().set(transaction);

  return null;
};
