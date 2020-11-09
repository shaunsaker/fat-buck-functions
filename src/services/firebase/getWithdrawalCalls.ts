import { firebase } from '.';
import { WithdrawalCallData } from './models';

export const getWithdrawalCalls = async (): Promise<WithdrawalCallData[]> => {
  const depositCalls = await (
    await firebase.firestore().collection('withdrawalCalls').get()
  ).docs.map((doc) => {
    return {
      ...(doc.data() as WithdrawalCallData),
      id: doc.id,
    };
  });

  return depositCalls;
};
