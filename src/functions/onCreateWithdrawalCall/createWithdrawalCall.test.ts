import { CallableContext } from 'firebase-functions/lib/providers/https';
import { createWithdrawalCall } from '.';
import {
  INSUFFICIENT_FUNDS_ERROR_MESSAGE,
  NO_UID_ERROR_MESSAGE,
  NO_WALLET_ADDRESS_ERROR_MESSAGE,
  WithdrawalCallData,
  WithdrawalStatus,
} from '../../services/firebase/models';

describe('createWithdrawalCall', () => {
  it('returns an error if there is no uid', async () => {
    const data = {
      walletAddress: '12345678',
      amount: 1,
    };

    // we don't care what's in here, just that uid is not present
    const context = {} as CallableContext;
    const getUserBalance = jest.fn(
      () => new Promise<number>((resolve) => resolve(2)),
    );
    const saveWithdrawalCall = jest.fn();
    const result = await createWithdrawalCall({
      data,
      context,
      onGetUserBalance: getUserBalance,
      onSaveWithdrawalCall: saveWithdrawalCall,
    });

    expect(result.error).toEqual(true);
    expect(result.message).toEqual(NO_UID_ERROR_MESSAGE);
    expect(saveWithdrawalCall).not.toHaveBeenCalled();
  });

  it('returns an error if there is no wallet address', async () => {
    const data = {
      walletAddress: '',
      amount: 1,
    };
    const context = {
      auth: {
        uid: '12345678',
      },
    } as CallableContext;
    const getUserBalance = jest.fn(
      () => new Promise<number>((resolve) => resolve(2)),
    );
    const saveWithdrawalCall = jest.fn();
    const result = await createWithdrawalCall({
      data,
      context,
      onGetUserBalance: getUserBalance,
      onSaveWithdrawalCall: saveWithdrawalCall,
    });

    expect(result.error).toEqual(true);
    expect(result.message).toEqual(NO_WALLET_ADDRESS_ERROR_MESSAGE);
    expect(saveWithdrawalCall).not.toHaveBeenCalled();
  });

  it('returns an error if the user requests to withdraw more than is in their account', async () => {
    const data = {
      walletAddress: '12345678',
      amount: 1,
    };
    const context = {
      auth: {
        uid: '12345678',
      },
    } as CallableContext;
    const userBalance = 0.5; // anything lower than data.amount
    const getUserBalance = jest.fn(
      () => new Promise<number>((resolve) => resolve(userBalance)),
    );
    const saveWithdrawalCall = jest.fn();
    const result = await createWithdrawalCall({
      data,
      context,
      onGetUserBalance: getUserBalance,
      onSaveWithdrawalCall: saveWithdrawalCall,
    });

    expect(result.error).toEqual(true);
    expect(result.message).toEqual(INSUFFICIENT_FUNDS_ERROR_MESSAGE);
    expect(saveWithdrawalCall).not.toHaveBeenCalled();
  });

  it('calls saveWithdrawalCall and returns success', async () => {
    const walletAddress = '12345678';
    const amount = 1;
    const data = {
      walletAddress,
      amount,
    };
    const uid = '1111111';
    const context = {
      auth: {
        uid,
      },
    } as CallableContext;
    const userBalance = 5; // anything higher than data.amount
    const getUserBalance = jest.fn(
      () => new Promise<number>((resolve) => resolve(userBalance)),
    );
    const saveWithdrawalCall = jest.fn();
    const result = await createWithdrawalCall({
      data,
      context,
      onGetUserBalance: getUserBalance,
      onSaveWithdrawalCall: saveWithdrawalCall,
    });
    const expectedDepositCallData: WithdrawalCallData = {
      uid,
      date: '',
      walletAddress,
      amount,
      status: WithdrawalStatus.PENDING,
    };

    expect(saveWithdrawalCall).toHaveBeenCalledWith(expectedDepositCallData);
    expect(result.success).toEqual(true);
  });
});
