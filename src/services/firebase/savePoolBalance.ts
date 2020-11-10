import { firebase } from '.';
import { PoolBalanceData } from './models';

export const savePoolBalance = async (data: PoolBalanceData): Promise<void> => {
  console.log('Saving pool balance.');
  await firebase
    .firestore()
    .collection('pool')
    .doc('balance')
    .set(data, { merge: true });
};
