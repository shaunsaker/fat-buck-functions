import { firebase } from '.';
import { PoolCommissionData } from './models';

export const updatePoolCommission = async (
  data: PoolCommissionData,
): Promise<null> => {
  console.log('Updating pool commission.');
  await firebase.firestore().collection('pool').doc('commission').update(data);

  return null;
};
