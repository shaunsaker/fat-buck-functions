import * as functions from "firebase-functions";
import { EMAIL_USERNAME } from "../config";
import { mailer } from "../services/mailer";
import { ApiHealth } from "../models";

const onWriteBotIsAlive = functions.firestore.document("bots/{botId}").onWrite(async (change) => {
  if (change.after.exists) {
    const { isAlive: isAliveBefore } = change.before.data() as ApiHealth;
    const { isAlive: isAliveAfter } = change.after.data() as ApiHealth;

    if (isAliveBefore && !isAliveAfter) {
      const botId = change.after.id;

      await mailer({
        to: EMAIL_USERNAME,
        subject: `${botId} is down!`,
        text: "The Bot's REST API is down.",
      });
    }
  }
});

export { onWriteBotIsAlive };
