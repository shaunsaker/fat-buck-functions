import { firebase } from '.';
import { UserData } from './models';

export const getUsersWithBalances = async (): Promise<UserData[]> => {
  const usersWithBalances = await (
    await firebase
      .firestore()
      .collection('users')
      .where('balance', '>=', 0)
      .get()
  ).docs.map((doc) => {
    return {
      ...(doc.data() as UserData),
      id: doc.id,
    };
  });

  return usersWithBalances;
};
