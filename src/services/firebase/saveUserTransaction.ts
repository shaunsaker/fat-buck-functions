import { firebase } from '.';
import { TransactionData } from './models';

export const saveUserTransaction = async (
  uid: string,
  data: TransactionData,
): Promise<null> => {
  console.log('Saving user transaction.');
  await firebase
    .firestore()
    .collection('users')
    .doc(uid)
    .collection('transactions')
    .doc()
    .set(data);

  return null;
};
