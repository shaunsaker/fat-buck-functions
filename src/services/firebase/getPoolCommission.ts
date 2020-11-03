import { firebase } from '.';
import { PoolCommissionData } from './models';

export const getPoolCommission = async (): Promise<number> => {
  const { amount: currentPoolCommission } = (await (
    await firebase.firestore().collection('pool').doc('commission').get()
  ).data()) as PoolCommissionData;

  return currentPoolCommission;
};
