import { TransactionData } from '../../services/firebase/models';
import { makeDepositTransaction } from '../../testUtils/makeDepositTransaction';
import { makeTradeTransaction } from '../../testUtils/makeTradeTransaction';
import { calculateTotalProfit } from './calculateTotalProfit';
import * as moment from 'moment';
import { toBTCDigits } from '../../utils/toBTCDigits';

describe('calculateTotalProfit', () => {
  it('returns 0 when there are no transactions', () => {
    const transactions: TransactionData[] = [];
    const { ratio, amount } = calculateTotalProfit(transactions);

    expect(ratio).toEqual(0);
    expect(amount).toEqual(0);
  });

  it('returns 0 when there are no trade transactions', () => {
    const transactions: TransactionData[] = [
      makeDepositTransaction({}),
      makeDepositTransaction({}),
      makeDepositTransaction({}),
    ];
    const { ratio, amount } = calculateTotalProfit(transactions);

    expect(ratio).toEqual(0);
    expect(amount).toEqual(0);
  });

  it('returns the profit ratio when there are no deposits/withdrawals after the last trade', () => {
    const earliestDate = moment().toISOString();
    const latestDate = moment().add(5, 'days').toISOString();
    const depositTransaction = makeDepositTransaction({
      date: earliestDate,
    });
    const tradeTransaction = makeTradeTransaction({
      date: latestDate,
    });
    const transactions: TransactionData[] = [
      depositTransaction,
      tradeTransaction,
    ];
    const { ratio, amount } = calculateTotalProfit(transactions);
    const expectedTotalProfit = toBTCDigits(
      tradeTransaction.amount /
        (tradeTransaction.amount + depositTransaction.amount),
    );

    expect(ratio).toEqual(expectedTotalProfit);
    expect(amount).toEqual(tradeTransaction.amount);
  });

  it('returns the profit ratio when there are deposits/withdrawals after the last trade', () => {
    const earliestDate = moment().toISOString();
    const latestDate = moment().add(5, 'days').toISOString();
    const depositTransaction = makeDepositTransaction({
      date: earliestDate,
    });
    const tradeTransaction = makeTradeTransaction({
      date: earliestDate,
    });
    const transactions: TransactionData[] = [
      depositTransaction,
      tradeTransaction,
      makeDepositTransaction({
        date: latestDate,
      }),
    ];
    const { ratio, amount } = calculateTotalProfit(transactions);
    const expectedTotalProfit = toBTCDigits(
      tradeTransaction.amount /
        (tradeTransaction.amount + depositTransaction.amount), // NOTE that we exclude the last deposit since it happened after the last trade
    );

    expect(ratio).toEqual(expectedTotalProfit);
    expect(amount).toEqual(tradeTransaction.amount);
  });
});
