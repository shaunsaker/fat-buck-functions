import * as functions from 'firebase-functions';
import { firebase } from '../../services/firebase';
import { getDate } from '../../utils/getDate';
import {
  DepositData,
  DepositStatus,
  CallDepositResponse,
  CallDepositArgs,
} from './models';

// creates a new deposit call
export const createDepositCall = functions.https.onCall(
  async (data: CallDepositArgs, context): Promise<CallDepositResponse> => {
    const uid = context.auth?.uid;

    if (!uid) {
      // this should not be possible
      return {
        error: true,
        message: 'You shall not pass.',
      };
    }

    // create a new deposit call
    const { walletAddress } = data;
    const depositData: DepositData = {
      uid,
      date: getDate(),
      walletAddress,
      status: DepositStatus.PENDING,
    };

    await firebase
      .firestore()
      .collection('depositCalls')
      .doc()
      .set(depositData);

    return {
      success: true,
    };
  },
);
