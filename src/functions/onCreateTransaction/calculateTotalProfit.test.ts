import { TransactionData } from '../../services/firebase/models';
import { makeDepositTransaction } from '../../testUtils/makeDepositTransaction';
import { makeTradeTransaction } from '../../testUtils/makeTradeTransaction';
import { makeWithdrawalTransaction } from '../../testUtils/makeWithdrawalTransaction';
import { getBalanceFromTransactions } from '../../utils/getBalanceFromTransactions';
import { calculateTotalProfit } from './calculateTotalProfit';

describe('calculateTotalProfit', () => {
  it('returns 0 when there is no pool balance', () => {
    const poolBalance = 0;
    const transactions: TransactionData[] = [];
    const totalProfit = calculateTotalProfit(poolBalance, transactions);

    expect(totalProfit).toEqual(0);
  });

  it('returns 0 when there are no transactions', () => {
    const poolBalance = 1;
    const transactions: TransactionData[] = [];
    const totalProfit = calculateTotalProfit(poolBalance, transactions);

    expect(totalProfit).toEqual(0);
  });

  it('returns the profit ratio when there are only deposits', () => {
    const transactions: TransactionData[] = [
      makeDepositTransaction(),
      makeDepositTransaction(),
      makeDepositTransaction(),
    ];
    const actualBalance = getBalanceFromTransactions(transactions);
    const actualProfit = 1; // NOTE that this is positive
    const poolBalance = actualBalance + actualProfit;
    const calculatedProfit = calculateTotalProfit(poolBalance, transactions);

    expect(calculatedProfit).toBeGreaterThan(0); // any positive number
  });

  it('returns the profit ratio when there are both deposits and withdrawals', () => {
    const transactions: TransactionData[] = [
      makeDepositTransaction(),
      makeDepositTransaction(),
      makeDepositTransaction(),
    ];
    const withdrawal = makeWithdrawalTransaction({ transactions });
    transactions.push(withdrawal);
    const actualBalance = getBalanceFromTransactions(transactions);
    const actualProfit = 1; // NOTE that this is positive
    const poolBalance = actualBalance + actualProfit;
    const totalProfit = calculateTotalProfit(poolBalance, transactions);

    expect(totalProfit).toBeGreaterThan(0); // any positive number
  });

  it('returns the profit ratio as normal', () => {
    const transactions: TransactionData[] = [
      makeDepositTransaction(),
      makeDepositTransaction(),
      makeDepositTransaction(),
      makeTradeTransaction(),
      makeTradeTransaction(),
      makeTradeTransaction(),
    ];
    const withdrawal = makeWithdrawalTransaction({ transactions });
    transactions.push(withdrawal);
    const actualBalance = getBalanceFromTransactions(transactions); // NOTE that we use the actual balance, the profit/loss comes from the trades
    const totalProfit = calculateTotalProfit(actualBalance, transactions);

    expect(totalProfit).toEqual(expect.any(Number));
  });
});
