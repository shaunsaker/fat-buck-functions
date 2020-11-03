import { firebase } from '.';
import { DepositTransactionData } from './models';

export const saveUserDepositTransaction = async (
  uid: string,
  data: DepositTransactionData,
): Promise<null> => {
  console.log('Saving user deposit transaction.');
  await firebase
    .firestore()
    .collection('users')
    .doc(uid)
    .collection('transactions')
    .doc()
    .set(data);

  return null;
};
