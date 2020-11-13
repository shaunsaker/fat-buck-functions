import { firebase } from '.';
import { DepositCallData } from './models';

export const saveDepositCall = async (
  data: DepositCallData,
  id = '',
): Promise<void> => {
  await firebase
    .firestore()
    .collection('depositCalls')
    .doc(id)
    .set(data, { merge: Boolean(id) });
};
