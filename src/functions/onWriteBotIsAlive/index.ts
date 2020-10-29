import * as functions from 'firebase-functions';
import { mailer } from '../../services/mailer';
import { BotData } from '../../services/firebase/models';

export const onWriteBotIsAlive = functions.firestore
  .document('bots/{botId}')
  .onWrite(async (change) => {
    if (change.after.exists) {
      const { isAlive: isAliveBefore } = change.before.data() as BotData;
      const { isAlive: isAliveAfter } = change.after.data() as BotData;

      if (isAliveBefore && !isAliveAfter) {
        const botId = change.after.id;

        await mailer({
          to: process.env.EMAIL_USERNAME,
          subject: `${botId} is down!`,
          text: "The Bot's REST API is down.",
        });
      }
    }
  });
