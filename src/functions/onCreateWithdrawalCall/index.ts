import * as functions from 'firebase-functions';
import { saveWithdrawalCall } from '../../services/firebase/saveWithdrawalCall';
import { getDate } from '../../utils/getDate';
import {
  CallResponse,
  INSUFFICIENT_FUNDS_ERROR_MESSAGE,
  NO_UID_ERROR_MESSAGE,
  NO_WALLET_ADDRESS_ERROR_MESSAGE,
  WithdrawalCallArgs,
  WithdrawalCallData,
  WithdrawalStatus,
} from '../../services/firebase/models';
import { CallableContext } from 'firebase-functions/lib/providers/https';
import { getUserBalance } from '../../services/firebase/getUserBalance';

export const createWithdrawalCall = async ({
  data,
  context,
  onGetUserBalance,
  onSaveWithdrawalCall,
}: {
  data: WithdrawalCallArgs;
  context: CallableContext;
  onGetUserBalance: typeof getUserBalance;
  onSaveWithdrawalCall: typeof saveWithdrawalCall;
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

  // check if the user's balance is >= withdrawal amount
  const userBalance = await onGetUserBalance(uid);
  const { amount } = data;

  if (userBalance < amount) {
    return {
      error: true,
      message: INSUFFICIENT_FUNDS_ERROR_MESSAGE,
    };
  }

  // create a new withdrawal call
  const withdrawalCallData: WithdrawalCallData = {
    uid,
    date: getDate(),
    walletAddress,
    amount,
    status: WithdrawalStatus.PENDING,
  };

  await onSaveWithdrawalCall(withdrawalCallData);

  return {
    success: true,
  };
};

export const onCreateWithdrawalCall = functions.https.onCall(
  async (data: WithdrawalCallArgs, context: CallableContext) =>
    createWithdrawalCall({
      data,
      context,
      onGetUserBalance: getUserBalance,
      onSaveWithdrawalCall: saveWithdrawalCall,
    }),
);
