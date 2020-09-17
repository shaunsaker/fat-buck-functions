import * as functions from "firebase-functions";
import { EMAIL_USERNAME } from "../config";
import { mailer } from "../mailer";
import { ApiHealth } from "../models";

const onWriteBotIsAlive = functions.firestore.document("bots/{botId}").onWrite(async (change) => {
  if (change.after.exists) {
    const { isAlive } = change.after.data() as ApiHealth;

    if (!isAlive) {
      await mailer({
        to: EMAIL_USERNAME,
        subject: "BOT API DOWN",
        text: "The Bot's REST API is down.",
      });
    }
  }
});

export { onWriteBotIsAlive };
