import { firebase } from '.';
import { PoolCommissionData } from './models';

export const savePoolCommission = async (
  data: PoolCommissionData,
): Promise<null> => {
  console.log('Saving pool commission.');
  await firebase
    .firestore()
    .collection('pool')
    .doc('commission')
    .set(data, { merge: true });

  return null;
};
