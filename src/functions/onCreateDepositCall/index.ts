import * as functions from 'firebase-functions';
import { saveDepositCall } from '../../services/firebase/saveDepositCall';
import { getDate } from '../../utils/getDate';
import {
  CallResponse,
  DepositCallArgs,
  DepositCallData,
  DepositStatus,
  NO_UID_ERROR_MESSAGE,
  NO_WALLET_ADDRESS_ERROR_MESSAGE,
} from '../../services/firebase/models';
import { CallableContext } from 'firebase-functions/lib/providers/https';

export const createDepositCall = async ({
  data,
  context,
  onSaveDepositCall,
}: {
  data: DepositCallArgs;
  context: CallableContext;
  onSaveDepositCall: typeof saveDepositCall;
}): Promise<CallResponse> => {
  const uid = context.auth?.uid;

  if (!uid) {
    // this should not be possible
    return {
      error: true,
      message: NO_UID_ERROR_MESSAGE,
    };
  }

  const { walletAddress } = data;
  if (!walletAddress) {
    return {
      error: true,
      message: NO_WALLET_ADDRESS_ERROR_MESSAGE,
    };
  }

  // create a new deposit call
  const depositCallData: DepositCallData = {
    uid,
    date: getDate(),
    walletAddress,
    status: DepositStatus.PENDING,
  };

  await onSaveDepositCall(depositCallData);

  return {
    success: true,
  };
};

export const onCreateDepositCall = functions.https.onCall(
  async (data: DepositCallArgs, context: CallableContext) =>
    createDepositCall({ data, context, onSaveDepositCall: saveDepositCall }),
);
