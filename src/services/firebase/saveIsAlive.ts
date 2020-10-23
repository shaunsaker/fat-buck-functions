import { firebase } from '.';
import { getDate } from '../../utils/getDate';

export const saveIsAlive = async (
  botId: string,
  isAlive: boolean,
): Promise<void> => {
  const date = getDate();

  await firebase.firestore().collection('bots').doc(botId).set(
    {
      isAlive,
      dateUpdated: date,
    },
    { merge: true },
  );
};
