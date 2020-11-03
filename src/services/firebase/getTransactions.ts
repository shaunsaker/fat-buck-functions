import { firebase } from '.';
import { TransactionData } from './models';

export const getTransactions = async (): Promise<TransactionData[]> => {
  return (await firebase.firestore().collection('transactions').get()).docs.map(
    (doc) => {
      return {
        ...(doc.data() as TransactionData),
        id: doc.id,
      };
    },
  );
};
