import { firebase } from '.';
import { CommissionTransactionData } from './models';

export const saveUserCommissionTransaction = async (
  uid: string,
  data: CommissionTransactionData,
): Promise<null> => {
  console.log('Saving user commission transaction.');
  await firebase
    .firestore()
    .collection('users')
    .doc(uid)
    .collection('transactions')
    .doc()
    .set(data);

  return null;
};
