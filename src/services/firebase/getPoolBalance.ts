import { firebase } from '.';
import { PoolBalanceData } from './models';

export const getPoolBalance = async (): Promise<number> => {
  const { amount: poolBalance } = (await (
    await firebase.firestore().collection('pool').doc('balance').get()
  ).data()) as PoolBalanceData;

  return poolBalance;
};
