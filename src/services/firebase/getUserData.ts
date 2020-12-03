import { firebase } from '.';
import { UserData } from './models';

export const getUserData = async (uid: string): Promise<UserData> => {
  const data = (await (
    await firebase.firestore().collection('users').doc(uid).get()
  ).data()) as UserData;

  return data;
};
