import { firebase } from '.';
import { DepositCallData } from './models';

export const saveDepositCall = async (
  data: DepositCallData,
  id?: string,
): Promise<void> => {
  console.log({ data, id });
  const ref = await firebase.firestore().collection('depositCalls');

  if (id) {
    ref.doc(id).set(data, { merge: true });
  } else {
    ref.doc().set(data);
  }
};
