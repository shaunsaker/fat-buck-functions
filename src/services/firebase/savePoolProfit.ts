import { firebase } from '.';
import { PoolProfitData } from './models';

export const savePoolProfit = async (data: PoolProfitData): Promise<null> => {
  console.log('Saving pool profit.');
  await firebase
    .firestore()
    .collection('pool')
    .doc('profit')
    .set(data, { merge: true });

  return null;
};
