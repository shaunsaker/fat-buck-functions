import { firebase } from '.';
import { DepositCallData } from './models';

export const getDepositCalls = async (): Promise<DepositCallData[]> => {
  const depositCalls = await (
    await firebase.firestore().collection('depositCalls').get()
  ).docs.map((doc) => {
    return {
      ...(doc.data() as DepositCallData),
      id: doc.id,
    };
  });

  return depositCalls;
};
