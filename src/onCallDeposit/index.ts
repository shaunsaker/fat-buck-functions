import * as functions from "firebase-functions";
import moment = require("moment");
import { admin } from "../admin";
import { DepositData, DepositStatus, OnCallDepositResponse } from "./models";

// creates a new deposit call
export const onCallDeposit = functions.https.onCall(
  async (data, context): Promise<OnCallDepositResponse> => {
    const uid = context.auth?.uid;

    if (!uid) {
      // this should not be possible
      return {
        error: true,
        message: "You shall not pass.",
      };
    }

    // create a new deposit call
    const { walletAddress } = data;
    const depositData: DepositData = {
      uid,
      date: moment().toISOString(),
      walletAddress,
      status: DepositStatus.PENDING,
    };

    await admin.firestore().collection("depositCalls").doc().set(depositData);

    return {
      success: true,
    };
  }
);
