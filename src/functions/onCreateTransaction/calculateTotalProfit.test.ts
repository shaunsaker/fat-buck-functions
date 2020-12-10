import { TransactionData } from '../../services/firebase/models';
import { makeDepositTransaction } from '../../testUtils/makeDepositTransaction';
import { makeTradeTransaction } from '../../testUtils/makeTradeTransaction';
import { calculateTotalProfit } from './calculateTotalProfit';

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

  it('returns the ratio and amount when there are trade transactions', () => {
    const transactions: TransactionData[] = [
      makeTradeTransaction({}),
      makeTradeTransaction({}),
      makeTradeTransaction({}),
    ];

    const { ratio, amount } = calculateTotalProfit(transactions);

    expect(ratio).toEqual(expect.any(Number));
    expect(amount).toEqual(expect.any(Number));
  });
});
