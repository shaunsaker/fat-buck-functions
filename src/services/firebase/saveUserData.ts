import { firebase } from '.';
import { UserData } from './models';

export const saveUserData = async (
  uid: string,
  data: UserData,
): Promise<null> => {
  console.log('Saving user data.');
  await firebase
    .firestore()
    .collection('users')
    .doc(uid)
    .set(data, { merge: true });

  return null;
};
