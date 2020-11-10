import { processWithdrawals } from '../handleWithdrawals';
import {
  BinanceWithdrawalList,
  BinanceWithdrawalStatus,
  BINANCE_WITHDRAWAL_FEE,
} from '../../services/binance/models';
import {
  WithdrawalCallData,
  WithdrawalStatus,
  WithdrawalTransactionData,
  TransactionType,
} from '../../services/firebase/models';
import { getDate } from '../../utils/getDate';
import { getUniqueId } from '../../utils/getUniqueId';
import { randomise } from '../../utils/randomise';
import { makeBinanceWithdrawal } from '../../testUtils/makeBinanceWithdrawal';
import { makeWithdrawalCall } from '../../testUtils/makeWithdrawalCall';

describe('handleWithdrawals', () => {
  const onSaveTransaction = jest.fn();
  const onSaveWithdrawalCall = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('works when withdrawal history and withdrawal calls are empty', async () => {
    const withdrawalHistory: BinanceWithdrawalList = [];
    const withdrawalCalls: WithdrawalCallData[] = [];
    const onGetWithdrawalHistory = jest.fn(
      () =>
        new Promise<BinanceWithdrawalList>((resolve) =>
          resolve(withdrawalHistory),
        ),
    );
    const onGetWithdrawalCalls = jest.fn(
      () =>
        new Promise<WithdrawalCallData[]>((resolve) =>
          resolve(withdrawalCalls),
        ),
    );

    await processWithdrawals({
      onGetWithdrawalHistory,
      onGetWithdrawalCalls,
      onSaveTransaction,
      onSaveWithdrawalCall,
    });

    expect(onGetWithdrawalHistory).toHaveBeenCalled();
    expect(onGetWithdrawalCalls).toHaveBeenCalled();
    expect(onSaveTransaction).not.toHaveBeenCalled();
    expect(onSaveWithdrawalCall).not.toHaveBeenCalled();
  });

  it('works when withdrawal history is empty but there are withdrawal calls', async () => {
    const withdrawalHistory: BinanceWithdrawalList = [];
    const withdrawalCalls: WithdrawalCallData[] = [
      makeWithdrawalCall({}),
      makeWithdrawalCall({}),
      makeWithdrawalCall({}),
    ];
    const onGetWithdrawalHistory = jest.fn(
      () =>
        new Promise<BinanceWithdrawalList>((resolve) =>
          resolve(withdrawalHistory),
        ),
    );
    const onGetWithdrawalCalls = jest.fn(
      () =>
        new Promise<WithdrawalCallData[]>((resolve) =>
          resolve(withdrawalCalls),
        ),
    );

    await processWithdrawals({
      onGetWithdrawalHistory,
      onGetWithdrawalCalls,
      onSaveTransaction,
      onSaveWithdrawalCall,
    });

    expect(onGetWithdrawalHistory).toHaveBeenCalled();
    expect(onGetWithdrawalCalls).toHaveBeenCalled();
    expect(onSaveTransaction).not.toHaveBeenCalled();
    expect(onSaveWithdrawalCall).not.toHaveBeenCalled();
  });

  it('works with a matching pending withdrawal', async () => {
    const walletAddress = getUniqueId();
    const binanceTransactionId = getUniqueId();
    const withdrawalHistory: BinanceWithdrawalList = randomise([
      makeBinanceWithdrawal({}),
      makeBinanceWithdrawal({}),
      makeBinanceWithdrawal({}),
      makeBinanceWithdrawal({ walletAddress, binanceTransactionId }),
    ]);
    const withdrawalCall = makeWithdrawalCall({ walletAddress });
    const withdrawalCalls: WithdrawalCallData[] = randomise([
      makeWithdrawalCall({}),
      makeWithdrawalCall({}),
      makeWithdrawalCall({}),
      withdrawalCall,
    ]);
    const onGetWithdrawalHistory = jest.fn(
      () =>
        new Promise<BinanceWithdrawalList>((resolve) =>
          resolve(withdrawalHistory),
        ),
    );
    const onGetWithdrawalCalls = jest.fn(
      () =>
        new Promise<WithdrawalCallData[]>((resolve) =>
          resolve(withdrawalCalls),
        ),
    );

    await processWithdrawals({
      onGetWithdrawalHistory,
      onGetWithdrawalCalls,
      onSaveTransaction,
      onSaveWithdrawalCall,
    });

    const expectedWithdrawal: WithdrawalCallData = {
      ...withdrawalCall,
      binanceTransactionId,
    };

    expect(onGetWithdrawalHistory).toHaveBeenCalled();
    expect(onGetWithdrawalCalls).toHaveBeenCalled();
    expect(onSaveTransaction).not.toHaveBeenCalled();
    expect(onSaveWithdrawalCall).toHaveBeenCalledWith(
      expectedWithdrawal,
      expectedWithdrawal.id,
    );
  });

  it('works with multiple matching pending withdrawals', async () => {
    const walletAddress1 = getUniqueId();
    const transactionId1 = getUniqueId();
    const walletAddress2 = getUniqueId();
    const transactionId2 = getUniqueId();
    const withdrawalHistory: BinanceWithdrawalList = randomise([
      makeBinanceWithdrawal({}),
      makeBinanceWithdrawal({}),
      makeBinanceWithdrawal({}),
      makeBinanceWithdrawal({
        walletAddress: walletAddress1,
        binanceTransactionId: transactionId1,
      }),
      makeBinanceWithdrawal({
        walletAddress: walletAddress2,
        binanceTransactionId: transactionId2,
      }),
    ]);
    const withdrawalCall1 = makeWithdrawalCall({
      walletAddress: walletAddress1,
    });
    const withdrawalCall2 = makeWithdrawalCall({
      walletAddress: walletAddress2,
    });
    const withdrawalCalls: WithdrawalCallData[] = randomise([
      makeWithdrawalCall({}),
      makeWithdrawalCall({}),
      makeWithdrawalCall({}),
      withdrawalCall1,
      withdrawalCall2,
    ]);
    const onGetWithdrawalHistory = jest.fn(
      () =>
        new Promise<BinanceWithdrawalList>((resolve) =>
          resolve(withdrawalHistory),
        ),
    );
    const onGetWithdrawalCalls = jest.fn(
      () =>
        new Promise<WithdrawalCallData[]>((resolve) =>
          resolve(withdrawalCalls),
        ),
    );

    await processWithdrawals({
      onGetWithdrawalHistory,
      onGetWithdrawalCalls,
      onSaveTransaction,
      onSaveWithdrawalCall,
    });

    expect(onGetWithdrawalHistory).toHaveBeenCalled();
    expect(onGetWithdrawalCalls).toHaveBeenCalled();
    expect(onSaveTransaction).not.toHaveBeenCalled();
    expect(onSaveWithdrawalCall).toHaveBeenCalledTimes(2);
  });

  it('works with a matching completed withdrawal', async () => {
    const walletAddress = getUniqueId();
    const transactionId = getUniqueId();
    const amount = 0.1;
    const expectedResolvedAmount = 0.1 - BINANCE_WITHDRAWAL_FEE;
    const withdrawal = makeBinanceWithdrawal({
      amount: expectedResolvedAmount,
      walletAddress,
      binanceTransactionId: transactionId,
      status: BinanceWithdrawalStatus.COMPLETED,
    });
    const withdrawalHistory: BinanceWithdrawalList = randomise([
      makeBinanceWithdrawal({}),
      makeBinanceWithdrawal({}),
      makeBinanceWithdrawal({}),
      withdrawal,
    ]);
    const withdrawalCall = makeWithdrawalCall({
      amount,
      walletAddress,
      binanceTransactionId: transactionId,
    });
    const withdrawalCalls: WithdrawalCallData[] = [
      makeWithdrawalCall({}),
      makeWithdrawalCall({}),
      makeWithdrawalCall({}),
      withdrawalCall,
    ];
    const onGetWithdrawalHistory = jest.fn(
      () =>
        new Promise<BinanceWithdrawalList>((resolve) =>
          resolve(withdrawalHistory),
        ),
    );
    const onGetWithdrawalCalls = jest.fn(
      () =>
        new Promise<WithdrawalCallData[]>((resolve) =>
          resolve(withdrawalCalls),
        ),
    );

    await processWithdrawals({
      onGetWithdrawalHistory,
      onGetWithdrawalCalls,
      onSaveTransaction,
      onSaveWithdrawalCall,
    });

    const date = getDate();
    const expectedTransaction: WithdrawalTransactionData = {
      uid: withdrawalCall.uid,
      walletAddress: withdrawalCall.walletAddress,
      withdrawalCallId: withdrawalCall.id,
      binanceTransactionId: transactionId,
      date,
      amount: withdrawalCall.amount,
      type: TransactionType.WITHDRAWAL,
      transactionFee: BINANCE_WITHDRAWAL_FEE,
      resolvedAmount: expectedResolvedAmount,
    };
    const expectedWithdrawalCall: WithdrawalCallData = {
      ...withdrawalCall,
      status: WithdrawalStatus.COMPLETED,
      resolvedDate: date,
    };

    expect(onGetWithdrawalHistory).toHaveBeenCalled();
    expect(onGetWithdrawalCalls).toHaveBeenCalled();
    expect(onSaveTransaction).toHaveBeenCalledWith(expectedTransaction);
    expect(onSaveWithdrawalCall).toHaveBeenCalledWith(
      expectedWithdrawalCall,
      expectedWithdrawalCall.id,
    );
  });

  it('works with multiple matching success withdrawals', async () => {
    const walletAddress1 = getUniqueId();
    const transactionId1 = getUniqueId();
    const walletAddress2 = getUniqueId();
    const transactionId2 = getUniqueId();
    const withdrawalHistory: BinanceWithdrawalList = randomise([
      makeBinanceWithdrawal({}),
      makeBinanceWithdrawal({}),
      makeBinanceWithdrawal({}),
      makeBinanceWithdrawal({
        walletAddress: walletAddress1,
        binanceTransactionId: transactionId1,
        status: BinanceWithdrawalStatus.COMPLETED,
      }),
      makeBinanceWithdrawal({
        walletAddress: walletAddress2,
        binanceTransactionId: transactionId2,
        status: BinanceWithdrawalStatus.COMPLETED,
      }),
    ]);
    const withdrawalCall1 = makeWithdrawalCall({
      walletAddress: walletAddress1,
      binanceTransactionId: transactionId1,
    });
    const withdrawalCall2 = makeWithdrawalCall({
      walletAddress: walletAddress2,
      binanceTransactionId: transactionId2,
    });
    const withdrawalCalls: WithdrawalCallData[] = randomise([
      makeWithdrawalCall({}),
      makeWithdrawalCall({}),
      makeWithdrawalCall({}),
      withdrawalCall1,
      withdrawalCall2,
    ]);
    const onGetWithdrawalHistory = jest.fn(
      () =>
        new Promise<BinanceWithdrawalList>((resolve) =>
          resolve(withdrawalHistory),
        ),
    );
    const onGetWithdrawalCalls = jest.fn(
      () =>
        new Promise<WithdrawalCallData[]>((resolve) =>
          resolve(withdrawalCalls),
        ),
    );

    await processWithdrawals({
      onGetWithdrawalHistory,
      onGetWithdrawalCalls,
      onSaveTransaction,
      onSaveWithdrawalCall,
    });

    expect(onGetWithdrawalHistory).toHaveBeenCalled();
    expect(onGetWithdrawalCalls).toHaveBeenCalled();
    expect(onSaveTransaction).toHaveBeenCalledTimes(2);
    expect(onSaveWithdrawalCall).toHaveBeenCalledTimes(2);
  });

  it('works with already matched successful withdrawals', async () => {
    const walletAddress = getUniqueId();
    const binanceTransactionId = getUniqueId();
    const withdrawal = makeBinanceWithdrawal({
      walletAddress,
      binanceTransactionId,
      status: BinanceWithdrawalStatus.COMPLETED,
    });
    const withdrawalHistory: BinanceWithdrawalList = randomise([
      makeBinanceWithdrawal({}),
      makeBinanceWithdrawal({}),
      makeBinanceWithdrawal({}),
      withdrawal,
    ]);
    const withdrawalCall = makeWithdrawalCall({
      walletAddress,
      binanceTransactionId,
      hasSuccess: true,
    });
    const withdrawalCalls: WithdrawalCallData[] = randomise([
      makeWithdrawalCall({}),
      makeWithdrawalCall({}),
      makeWithdrawalCall({}),
      withdrawalCall,
    ]);
    const onGetWithdrawalHistory = jest.fn(
      () =>
        new Promise<BinanceWithdrawalList>((resolve) =>
          resolve(withdrawalHistory),
        ),
    );
    const onGetWithdrawalCalls = jest.fn(
      () =>
        new Promise<WithdrawalCallData[]>((resolve) =>
          resolve(withdrawalCalls),
        ),
    );

    await processWithdrawals({
      onGetWithdrawalHistory,
      onGetWithdrawalCalls,
      onSaveTransaction,
      onSaveWithdrawalCall,
    });

    expect(onGetWithdrawalHistory).toHaveBeenCalled();
    expect(onGetWithdrawalCalls).toHaveBeenCalled();
    expect(onSaveTransaction).not.toBeCalled();
    expect(onSaveWithdrawalCall).not.toBeCalled();
  });

  it('works with withdrawals without matching withdrawal calls', async () => {
    const walletAddress = getUniqueId();
    const binanceTransactionId = getUniqueId();
    const withdrawal = makeBinanceWithdrawal({
      walletAddress,
      binanceTransactionId,
      status: BinanceWithdrawalStatus.COMPLETED,
    });
    const withdrawalHistory: BinanceWithdrawalList = randomise([
      makeBinanceWithdrawal({}),
      makeBinanceWithdrawal({}),
      makeBinanceWithdrawal({}),
      withdrawal,
    ]);
    const withdrawalCalls: WithdrawalCallData[] = [];
    const onGetWithdrawalHistory = jest.fn(
      () =>
        new Promise<BinanceWithdrawalList>((resolve) =>
          resolve(withdrawalHistory),
        ),
    );
    const onGetWithdrawalCalls = jest.fn(
      () =>
        new Promise<WithdrawalCallData[]>((resolve) =>
          resolve(withdrawalCalls),
        ),
    );

    await processWithdrawals({
      onGetWithdrawalHistory,
      onGetWithdrawalCalls,
      onSaveTransaction,
      onSaveWithdrawalCall,
    });

    expect(onGetWithdrawalHistory).toHaveBeenCalled();
    expect(onGetWithdrawalCalls).toHaveBeenCalled();
    expect(onSaveTransaction).not.toBeCalled();
    expect(onSaveWithdrawalCall).not.toBeCalled();
  });

  it('works with non-matching wallet address', async () => {
    const walletAddress = getUniqueId();
    const binanceTransactionId = getUniqueId();
    const withdrawal = makeBinanceWithdrawal({
      walletAddress,
      binanceTransactionId,
      status: BinanceWithdrawalStatus.COMPLETED,
    });
    const withdrawalHistory: BinanceWithdrawalList = randomise([
      makeBinanceWithdrawal({}),
      makeBinanceWithdrawal({}),
      makeBinanceWithdrawal({}),
      withdrawal,
    ]);
    const anotherWalletAddress = getUniqueId();
    const withdrawalCall = makeWithdrawalCall({
      walletAddress: anotherWalletAddress,
    });
    const withdrawalCalls: WithdrawalCallData[] = randomise([
      makeWithdrawalCall({}),
      makeWithdrawalCall({}),
      makeWithdrawalCall({}),
      withdrawalCall,
    ]);
    const onGetWithdrawalHistory = jest.fn(
      () =>
        new Promise<BinanceWithdrawalList>((resolve) =>
          resolve(withdrawalHistory),
        ),
    );
    const onGetWithdrawalCalls = jest.fn(
      () =>
        new Promise<WithdrawalCallData[]>((resolve) =>
          resolve(withdrawalCalls),
        ),
    );

    await processWithdrawals({
      onGetWithdrawalHistory,
      onGetWithdrawalCalls,
      onSaveTransaction,
      onSaveWithdrawalCall,
    });

    expect(onGetWithdrawalHistory).toHaveBeenCalled();
    expect(onGetWithdrawalCalls).toHaveBeenCalled();
    expect(onSaveTransaction).not.toBeCalled();
    expect(onSaveWithdrawalCall).not.toBeCalled();
  });
});
