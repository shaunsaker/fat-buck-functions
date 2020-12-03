import { firebase } from '.';
import { UserData } from './models';

export const getUsersWithBalances = async (): Promise<Partial<UserData>[]> => {
  const usersWithBalances = await (
    await firebase
      .firestore()
      .collection('users')
      .where('balance', '>=', 0)
      .get()
  ).docs.map((doc) => {
    return {
      ...(doc.data() as Partial<UserData>),
      id: doc.id,
    };
  });

  return usersWithBalances;
};
