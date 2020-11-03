import { firebase } from '.';
import { UserData } from './models';

export const updateUserBalance = async (
  uid: string,
  data: UserData,
): Promise<null> => {
  console.log('Updating user balance.');
  await firebase.firestore().collection('users').doc(uid).update(data);

  return null;
};
