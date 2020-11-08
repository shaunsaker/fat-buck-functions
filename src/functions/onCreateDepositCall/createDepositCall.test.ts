import { CallableContext } from 'firebase-functions/lib/providers/https';
import { createDepositCall } from '.';
import {
  DepositCallData,
  DepositStatus,
  NO_UID_ERROR_MESSAGE,
  NO_WALLET_ADDRESS_ERROR_MESSAGE,
} from '../../services/firebase/models';

describe('createDepositCall', () => {
  it('returns an error if there is no uid', async () => {
    const data = {
      walletAddress: '12345678',
    };

    // we don't care what's in here, just that uid is not present
    const context = {} as CallableContext;
    const saveDepositCall = jest.fn();
    const result = await createDepositCall({
      data,
      context,
      onSaveDepositCall: saveDepositCall,
    });

    expect(result.error).toEqual(true);
    expect(result.message).toEqual(NO_UID_ERROR_MESSAGE);
    expect(saveDepositCall).not.toHaveBeenCalled();
  });

  it('returns an error if there is no walletAddress', async () => {
    const data = {
      walletAddress: '',
    };
    const context = {
      auth: {
        uid: '12345678',
      },
    } as CallableContext;
    const saveDepositCall = jest.fn();
    const result = await createDepositCall({
      data,
      context,
      onSaveDepositCall: saveDepositCall,
    });

    expect(result.error).toEqual(true);
    expect(result.message).toEqual(NO_WALLET_ADDRESS_ERROR_MESSAGE);
    expect(saveDepositCall).not.toHaveBeenCalled();
  });

  it('calls saveDepositCall and returns success', async () => {
    const walletAddress = '12345678';
    const data = {
      walletAddress,
    };
    const uid = '12345678';
    const context = {
      auth: {
        uid,
      },
    } as CallableContext;
    const saveDepositCall = jest.fn();
    const result = await createDepositCall({
      data,
      context,
      onSaveDepositCall: saveDepositCall,
    });
    const expectedDepositCallData: DepositCallData = {
      uid,
      date: '',
      walletAddress,
      status: DepositStatus.PENDING,
    };

    expect(saveDepositCall).toHaveBeenCalledWith(expectedDepositCallData);
    expect(result.success).toEqual(true);
  });
});
