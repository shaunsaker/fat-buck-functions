import { processDeposits } from '../handleDeposits';
import {
  BinanceDepositHistory,
  BinanceDepositList,
  BinanceDepositStatus,
} from '../../services/binance/models';
import {
  DepositCallData,
  DepositStatus,
  DepositTransactionData,
  TransactionType,
} from '../../services/firebase/models';
import { getDate } from '../../utils/getDate';
import { getUniqueId } from '../../utils/getUniqueId';
import { randomise } from '../../utils/randomise';

const getDeposit = (
  walletAddress: string,
  binanceTransactionId: string,
  status?: BinanceDepositStatus,
  asset?: string,
): BinanceDepositHistory => {
  return {
    insertTime: Date.now(),
    amount: 1,
    asset: asset || 'BTC',
    address: walletAddress,
    txId: binanceTransactionId,
    status: status || BinanceDepositStatus.pending,
  };
};

const getRandomDeposits = (count: number) => {
  const walletAddress = getUniqueId();
  const binanceTransactionId = getUniqueId();
  return [...Array(count).keys()].map(() =>
    getDeposit(walletAddress, binanceTransactionId),
  );
};

const getDepositCall = (
  walletAddress?: string,
  binanceTransactionId?: string,
  hasSuccess?: boolean,
): DepositCallData => {
  return {
    id: getUniqueId(),
    uid: getUniqueId(),
    date: getDate(),
    walletAddress: walletAddress || getUniqueId(),
    status: hasSuccess ? DepositStatus.SUCCESS : DepositStatus.PENDING,
    binanceTransactionId,
    resolvedDate: hasSuccess ? getDate() : undefined,
  };
};

const getRandomDepositCalls = (count: number) => {
  return [...Array(count).keys()].map(() => getDepositCall());
};

describe('handleDeposits', () => {
  const onSaveTransaction = jest.fn();
  const onSaveDeposit = jest.fn();
  const date = getDate();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('works when deposit history and deposit calls are empty', async () => {
    const depositHistory: BinanceDepositList = [];
    const depositCalls: DepositCallData[] = [];

    await processDeposits(
      depositHistory,
      depositCalls,
      onSaveTransaction,
      onSaveDeposit,
      date,
    );

    expect(onSaveTransaction).not.toHaveBeenCalled();
    expect(onSaveDeposit).not.toHaveBeenCalled();
  });

  it('works when deposit history is empty but there are deposit calls', async () => {
    const depositHistory: BinanceDepositList = [];
    const depositCalls: DepositCallData[] = getRandomDepositCalls(5);

    await processDeposits(
      depositHistory,
      depositCalls,
      onSaveTransaction,
      onSaveDeposit,
      date,
    );

    expect(onSaveTransaction).not.toHaveBeenCalled();
    expect(onSaveDeposit).not.toHaveBeenCalled();
  });

  it('works with a matching pending deposit', async () => {
    const walletAddress = getUniqueId();
    const transactionId = getUniqueId();
    const depositHistory: BinanceDepositList = randomise([
      ...getRandomDeposits(5),
      getDeposit(walletAddress, transactionId),
    ]);
    const depositCall = getDepositCall(walletAddress);
    const depositCalls: DepositCallData[] = randomise([
      ...getRandomDepositCalls(5),
      depositCall,
    ]);

    await processDeposits(
      depositHistory,
      depositCalls,
      onSaveTransaction,
      onSaveDeposit,
      date,
    );

    const expectedDeposit: DepositCallData = {
      ...depositCall,
      binanceTransactionId: transactionId,
    };

    expect(onSaveTransaction).not.toHaveBeenCalled();
    expect(onSaveDeposit).toHaveBeenCalledWith(expectedDeposit);
  });

  it('works with multiple matching pending deposits', async () => {
    const walletAddress1 = getUniqueId();
    const transactionId1 = getUniqueId();
    const walletAddress2 = getUniqueId();
    const transactionId2 = getUniqueId();
    const depositHistory: BinanceDepositList = randomise([
      ...getRandomDeposits(5),
      getDeposit(walletAddress1, transactionId1),
      getDeposit(walletAddress2, transactionId2),
    ]);
    const depositCall1 = getDepositCall(walletAddress1);
    const depositCall2 = getDepositCall(walletAddress2);
    const depositCalls: DepositCallData[] = randomise([
      ...getRandomDepositCalls(5),
      depositCall1,
      depositCall2,
    ]);

    await processDeposits(
      depositHistory,
      depositCalls,
      onSaveTransaction,
      onSaveDeposit,
      date,
    );

    expect(onSaveTransaction).not.toHaveBeenCalled();
    expect(onSaveDeposit).toHaveBeenCalledTimes(2);
  });

  it('works with a matching verifying deposit', async () => {
    const walletAddress = getUniqueId();
    const transactionId = getUniqueId();
    const depositHistory: BinanceDepositList = randomise([
      ...getRandomDeposits(5),
      getDeposit(walletAddress, transactionId, BinanceDepositStatus.verifying),
    ]);
    const depositCall = getDepositCall(walletAddress);
    const depositCalls: DepositCallData[] = [
      ...getRandomDepositCalls(5),
      depositCall,
    ];

    await processDeposits(
      depositHistory,
      depositCalls,
      onSaveTransaction,
      onSaveDeposit,
      date,
    );

    const expectedDeposit: DepositCallData = {
      ...depositCall,
      binanceTransactionId: transactionId,
    };

    expect(onSaveTransaction).not.toHaveBeenCalled();
    expect(onSaveDeposit).toHaveBeenCalledWith(expectedDeposit);
  });

  it('works with a matching success deposit', async () => {
    const walletAddress = getUniqueId();
    const transactionId = getUniqueId();
    const deposit = getDeposit(
      walletAddress,
      transactionId,
      BinanceDepositStatus.success,
    );
    const depositHistory: BinanceDepositList = randomise([
      ...getRandomDeposits(5),
      deposit,
    ]);
    const depositCall = getDepositCall(walletAddress, transactionId);
    const depositCalls: DepositCallData[] = [
      ...getRandomDepositCalls(5),
      depositCall,
    ];

    await processDeposits(
      depositHistory,
      depositCalls,
      onSaveTransaction,
      onSaveDeposit,
      date,
    );

    const expectedTransaction: DepositTransactionData = {
      uid: depositCall.uid,
      walletAddress: depositCall.walletAddress,
      depositCallId: depositCall.id,
      binanceTransactionId: transactionId,
      date,
      amount: deposit.amount,
      type: TransactionType.DEPOSIT,
    };
    const expectedDeposit: DepositCallData = {
      ...depositCall,
      status: DepositStatus.SUCCESS,
      resolvedDate: date,
    };

    expect(onSaveTransaction).toHaveBeenCalledWith(expectedTransaction);
    expect(onSaveDeposit).toHaveBeenCalledWith(expectedDeposit);
  });

  it('works with multiple matching success deposits', async () => {
    const walletAddress1 = getUniqueId();
    const transactionId1 = getUniqueId();
    const walletAddress2 = getUniqueId();
    const transactionId2 = getUniqueId();
    const depositHistory: BinanceDepositList = randomise([
      ...getRandomDeposits(5),
      getDeposit(walletAddress1, transactionId1, BinanceDepositStatus.success),
      getDeposit(walletAddress2, transactionId2, BinanceDepositStatus.success),
    ]);
    const depositCall1 = getDepositCall(walletAddress1, transactionId1);
    const depositCall2 = getDepositCall(walletAddress2, transactionId2);
    const depositCalls: DepositCallData[] = randomise([
      ...getRandomDepositCalls(5),
      depositCall1,
      depositCall2,
    ]);

    await processDeposits(
      depositHistory,
      depositCalls,
      onSaveTransaction,
      onSaveDeposit,
      date,
    );

    expect(onSaveTransaction).toHaveBeenCalledTimes(2);
    expect(onSaveDeposit).toHaveBeenCalledTimes(2);
  });

  it('works with already matched successful deposits', async () => {
    const walletAddress = getUniqueId();
    const transactionId = getUniqueId();
    const deposit = getDeposit(
      walletAddress,
      transactionId,
      BinanceDepositStatus.success,
    );
    const depositHistory: BinanceDepositList = randomise([
      ...getRandomDeposits(5),
      deposit,
    ]);
    const depositCall = getDepositCall(walletAddress, transactionId, true);
    const depositCalls: DepositCallData[] = randomise([
      ...getRandomDepositCalls(5),
      depositCall,
    ]);

    await processDeposits(
      depositHistory,
      depositCalls,
      onSaveTransaction,
      onSaveDeposit,
      date,
    );

    expect(onSaveTransaction).not.toBeCalled();
    expect(onSaveDeposit).not.toBeCalled();
  });

  it('works with deposits without matching deposit calls', async () => {
    const walletAddress = getUniqueId();
    const transactionId = getUniqueId();
    const deposit = getDeposit(
      walletAddress,
      transactionId,
      BinanceDepositStatus.success,
    );
    const depositHistory: BinanceDepositList = randomise([
      ...getRandomDeposits(5),
      deposit,
    ]);
    const depositCalls: DepositCallData[] = [];

    await processDeposits(
      depositHistory,
      depositCalls,
      onSaveTransaction,
      onSaveDeposit,
      date,
    );

    expect(onSaveTransaction).not.toBeCalled();
    expect(onSaveDeposit).not.toBeCalled();
  });

  it('works with non-matching wallet address', async () => {
    const walletAddress = getUniqueId();
    const transactionId = getUniqueId();
    const deposit = getDeposit(
      walletAddress,
      transactionId,
      BinanceDepositStatus.success,
    );
    const depositHistory: BinanceDepositList = randomise([
      ...getRandomDeposits(5),
      deposit,
    ]);
    const anotherWalletAddress = getUniqueId();
    const depositCall = getDepositCall(anotherWalletAddress);
    const depositCalls: DepositCallData[] = randomise([
      ...getRandomDepositCalls(5),
      depositCall,
    ]);

    await processDeposits(
      depositHistory,
      depositCalls,
      onSaveTransaction,
      onSaveDeposit,
      date,
    );

    expect(onSaveTransaction).not.toBeCalled();
    expect(onSaveDeposit).not.toBeCalled();
  });

  it('handles non-BTC deposits', async () => {
    const walletAddress = getUniqueId();
    const transactionId = getUniqueId();
    const notBTC = 'IOTA';
    const deposit = getDeposit(
      walletAddress,
      transactionId,
      BinanceDepositStatus.success,
      notBTC,
    );
    const depositHistory: BinanceDepositList = randomise([
      ...getRandomDeposits(5),
      deposit,
    ]);
    const depositCall = getDepositCall(walletAddress, transactionId);
    const depositCalls: DepositCallData[] = randomise([
      ...getRandomDepositCalls(5),
      depositCall,
    ]);

    await processDeposits(
      depositHistory,
      depositCalls,
      onSaveTransaction,
      onSaveDeposit,
      date,
    );

    const expectedDeposit: DepositCallData = {
      ...depositCall,
      status: DepositStatus.ERROR,
      message: `We do not support ${notBTC} deposits. Your deposit will be returned to your wallet address, ${walletAddress}.`,
      binanceTransactionId: transactionId,
    };

    expect(onSaveTransaction).not.toBeCalled();
    expect(onSaveDeposit).toHaveBeenCalledWith(expectedDeposit);
  });
});
