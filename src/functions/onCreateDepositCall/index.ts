import * as functions from 'firebase-functions';
import { saveDepositCall } from '../../services/firebase/saveDepositCall';
import { getDate } from '../../utils/getDate';
import { DepositCallData, DepositStatus } from '../../services/firebase/models';
import { CallDepositArgs, CallDepositResponse } from './models';

// creates a new deposit call
export const onCreateDepositCall = functions.https.onCall(
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
    const depositCallData: DepositCallData = {
      uid,
      date: getDate(),
      walletAddress,
      status: DepositStatus.PENDING,
    };

    await saveDepositCall(depositCallData);

    return {
      success: true,
    };
  },
);
