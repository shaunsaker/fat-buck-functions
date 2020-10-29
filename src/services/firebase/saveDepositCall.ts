import { firebase } from '.';
import { DepositCallData } from './models';

export const saveDepositCall = async (
  depositCallData: DepositCallData,
  id?: string,
): Promise<void> => {
  await firebase
    .firestore()
    .collection('depositCalls')
    .doc(id)
    .set(depositCallData, { merge: Boolean(id) });
};
