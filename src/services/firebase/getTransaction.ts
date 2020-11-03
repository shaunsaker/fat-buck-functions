import { firebase } from '.';

export const getTransactionExists = async (
  transactionId: string,
): Promise<boolean> => {
  return (
    await firebase
      .firestore()
      .collection('transactions')
      .doc(transactionId)
      .get()
  ).exists;
};
