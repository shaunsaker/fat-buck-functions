import { TransactionData } from '../../services/firebase/models';
import { makeTradeTransaction } from '../../testUtils/makeTradeTransaction';
import { calculateTotalProfit } from './calculateTotalProfit';

describe('calculateTotalProfit', () => {
  it('returns 0 when there are no trades', () => {
    const transactions: TransactionData[] = [];
    const totalProfit = calculateTotalProfit(transactions);

    expect(totalProfit).toEqual(0);
  });

  it('returns a value where there are trades', () => {
    const transactions: TransactionData[] = [
      makeTradeTransaction(),
      makeTradeTransaction(),
      makeTradeTransaction(),
    ];
    const totalProfit = calculateTotalProfit(transactions);

    expect(totalProfit).toEqual(expect.any(Number));
  });
});
