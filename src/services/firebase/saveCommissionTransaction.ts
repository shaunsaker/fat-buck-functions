import { firebase } from '.';
import { CommissionTransactionData } from './models';

export const saveCommissionTransaction = async (
  data: CommissionTransactionData,
): Promise<null> => {
  console.log('Saving commission transaction.');
  await firebase.firestore().collection('transactions').doc().set(data);

  return null;
};
