import { firebase } from '.';
import { DepositData } from './models';

export const getDepositCalls = async (): Promise<DepositData[]> => {
  const depositCalls = await (
    await firebase.firestore().collection('depositCalls').get()
  ).docs.map((doc) => {
    return {
      ...(doc.data() as DepositData),
      id: doc.id,
    };
  });

  return depositCalls;
};
