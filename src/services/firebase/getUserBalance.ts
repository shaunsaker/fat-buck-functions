import { firebase } from '.';
import { toBTCDigits } from '../../utils/toBTCDigits';
import { UserData } from './models';

export const getUserBalance = async (uid: string): Promise<number> => {
  const initialUserBalance = toBTCDigits(0);
  const { balance: currentUserBalance = initialUserBalance } = (await (
    await firebase.firestore().collection('users').doc(uid).get()
  ).data()) as UserData;

  return currentUserBalance;
};
