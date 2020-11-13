import { firebase } from '.';
import { WithdrawalCallData } from './models';

export const saveWithdrawalCall = async (
  data: WithdrawalCallData,
  id = '',
): Promise<void> => {
  await firebase
    .firestore()
    .collection('withdrawalCall')
    .doc(id)
    .set(data, { merge: Boolean(id) });
};
