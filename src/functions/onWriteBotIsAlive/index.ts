import * as functions from 'firebase-functions';
import { mailer } from '../../services/mailer';
import { Change } from 'firebase-functions';
import { BotData } from '../../services/firebase/models';
import { DocumentSnapshot } from 'firebase-functions/lib/providers/firestore';

export type ChangeDocument = Change<Partial<DocumentSnapshot>>;

export const processBotChange = async ({
  change,
  onSendMail,
}: {
  change: ChangeDocument;
  onSendMail: typeof mailer;
}): Promise<null> => {
  if (change.after.exists) {
    const { isAlive: isAliveBefore } = change.before.data() as BotData;
    const { isAlive: isAliveAfter } = change.after.data() as BotData;

    if (isAliveBefore && !isAliveAfter) {
      const botId = change.after.id;

      await onSendMail({
        to: process.env.EMAIL_USERNAME,
        subject: `${botId} is down!`,
        text: "The Bot's REST API is down.",
      });
    }
  }

  return null;
};

export const onWriteBotIsAlive = functions.firestore
  .document('bots/{botId}')
  .onWrite(async (change) => {
    await processBotChange({
      change: change as ChangeDocument,
      onSendMail: mailer,
    });
  });
