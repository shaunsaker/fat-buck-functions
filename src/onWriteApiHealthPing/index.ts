import * as functions from "firebase-functions";
import { EMAIL_USERNAME } from "../config";
import { mailer } from "../mailer";
import { ApiHealth } from "../models";

const onWriteApiHealthPing = functions.firestore.document("api/health").onWrite(async (change) => {
  const { isAlive } = change.after.data() as ApiHealth;

  if (!isAlive) {
    await mailer({
      to: EMAIL_USERNAME,
      subject: "BOT API DOWN",
      text: "The Bot's REST API is down.",
    });
  }
});

export { onWriteApiHealthPing };
