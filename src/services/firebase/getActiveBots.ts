import { firebase } from '.';
import { BotData } from './models';

export const getActiveBots = async (): Promise<BotData[]> => {
  const activeBots = await (
    await firebase
      .firestore()
      .collection('bots')
      .where('isActive', '==', true)
      .get()
  ).docs.map((doc) => {
    return {
      ...(doc.data() as BotData),
      id: doc.id,
    };
  });

  return activeBots;
};
