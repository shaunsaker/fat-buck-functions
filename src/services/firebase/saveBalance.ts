import { firebase } from '.';
import { Balance } from '../bots/models';
import { getDate } from '../../utils/getDate';
import { PoolBalanceData } from './models';

export const saveBalance = async (balance: Balance): Promise<void> => {
  const date = getDate();
  const ref = firebase.firestore().collection('pool').doc('balance');
  const data: PoolBalanceData = {
    amount: balance.total,
    lastUpdated: date,
  };
  await ref.set(data);
};
