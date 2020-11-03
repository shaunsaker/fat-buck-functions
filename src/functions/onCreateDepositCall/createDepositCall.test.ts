import { CallableContext } from 'firebase-functions/lib/providers/https';
import { createDepositCall } from '.';
import { DepositCallData, DepositStatus } from '../../services/firebase/models';
import { MOCKED_MOMENT_ISO_STRING } from '../../../__mocks__/moment';

describe('createDepositCall', () => {
  const walletAddress = '12345678';
  const data = {
    walletAddress,
  };
  const saveDepositCall = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns an error if there is no uid', async () => {
    // we don't care what's in here, just that uid is not present
    const context = {} as CallableContext;
    const result = await createDepositCall(data, context, saveDepositCall);

    expect(result.error).toEqual(true);
    expect(saveDepositCall).not.toHaveBeenCalled();
  });

  it('calls saveDepositCall and returns success', async () => {
    const uid = '1111111';
    const context = {
      auth: {
        uid,
      },
    } as CallableContext;
    const result = await createDepositCall(data, context, saveDepositCall);
    const expectedDepositCallData: DepositCallData = {
      uid,
      date: MOCKED_MOMENT_ISO_STRING,
      walletAddress,
      status: DepositStatus.PENDING,
    };

    expect(saveDepositCall).toHaveBeenCalledWith(expectedDepositCallData);
    expect(result.success).toEqual(true);
  });
});
