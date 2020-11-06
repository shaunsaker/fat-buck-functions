import { TransactionData } from '../services/firebase/models';
import { makeCommissionTransaction } from '../testUtils/makeCommissionTransaction';
import { makeDepositTransaction } from '../testUtils/makeDepositTransaction';
import { makeTradeTransaction } from '../testUtils/makeTradeTransaction';
import { makeWithdrawalTransaction } from '../testUtils/makeWithdrawalTransaction';
import { getBalanceFromTransactions } from './getBalanceFromTransactions';

describe('getBalanceFromTransactions', () => {
  it('returns 0 when there are no transactions', () => {
    const transactions: TransactionData[] = [];
    const balance = getBalanceFromTransactions(transactions);

    expect(balance).toEqual(0);
  });

  it('returns a value when there are deposits', () => {
    const depositA = makeDepositTransaction();
    const depositB = makeDepositTransaction();
    const transactions: TransactionData[] = [depositA, depositB];
    const expectedBalance = depositA.amount + depositB.amount;
    const balance = getBalanceFromTransactions(transactions);

    expect(balance).toEqual(expectedBalance);
  });

  it('doesnt include commission transactions in pool transactions calculation', () => {
    const depositA = makeDepositTransaction();
    const depositB = makeDepositTransaction();
    const commissionA = makeCommissionTransaction(depositA);
    const commissionB = makeCommissionTransaction(depositB);
    const transactions: TransactionData[] = [
      depositA,
      depositB,
      commissionA,
      commissionB,
    ];
    const expectedBalance = depositA.amount + depositB.amount; // NOTE that we don't include the commission transactions
    const balance = getBalanceFromTransactions(transactions);

    expect(balance).toEqual(expectedBalance);
  });

  it('includes commission transactions in user transactions calculation', () => {
    const depositA = makeDepositTransaction();
    const depositB = makeDepositTransaction();
    const commissionA = makeCommissionTransaction(depositA);
    const commissionB = makeCommissionTransaction(depositB);
    const transactions: TransactionData[] = [
      depositA,
      depositB,
      commissionA,
      commissionB,
    ];
    const expectedBalance =
      depositA.amount +
      depositB.amount -
      commissionA.amount -
      commissionB.amount;
    const balance = getBalanceFromTransactions(transactions, true);

    expect(balance).toEqual(expectedBalance);
  });

  it('returns a value when there are deposits, withdrawals and commission', () => {
    const depositA = makeDepositTransaction();
    const depositB = makeDepositTransaction();
    const commissionA = makeCommissionTransaction(depositA);
    const commissionB = makeCommissionTransaction(depositB);
    const transactions: TransactionData[] = [
      depositA,
      depositB,
      commissionA,
      commissionB,
    ];
    const withdrawalA = makeWithdrawalTransaction(transactions);
    transactions.push(withdrawalA);

    const expectedBalance =
      depositA.amount + depositB.amount - withdrawalA.amount;
    const balance = getBalanceFromTransactions(transactions);

    expect(balance).toEqual(expectedBalance);
  });

  it('returns a value when there are deposits, withdrawals, commissions and trades', () => {
    const depositA = makeDepositTransaction();
    const depositB = makeDepositTransaction();
    const commissionA = makeCommissionTransaction(depositA);
    const commissionB = makeCommissionTransaction(depositB);
    const tradeA = makeTradeTransaction();
    const tradeB = makeTradeTransaction();
    const transactions: TransactionData[] = [
      depositA,
      depositB,
      commissionA,
      commissionB,
      tradeA,
      tradeB,
    ];
    const withdrawalA = makeWithdrawalTransaction(transactions);
    transactions.push(withdrawalA);

    const expectedBalance =
      depositA.amount +
      depositB.amount -
      withdrawalA.amount +
      tradeA.amount +
      tradeB.amount;
    const balance = getBalanceFromTransactions(transactions);

    expect(balance).toEqual(expectedBalance);
  });
});
