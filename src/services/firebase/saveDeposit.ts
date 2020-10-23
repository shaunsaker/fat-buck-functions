import { firebase } from '.';
import { DepositData } from './models';

export const saveDeposit = async (deposit: DepositData): Promise<null> => {
  await firebase
    .firestore()
    .collection('depositCalls')
    .doc(deposit.id)
    .set(deposit, { merge: true });

  return null;
};
