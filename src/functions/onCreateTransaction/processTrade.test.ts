import { getPoolBalance } from '../../services/firebase/getPoolBalance';
import { getTransactions } from '../../services/firebase/getTransactions';
import { getUsersWithBalances } from '../../services/firebase/getUsersWithBalances';
import {
  PoolProfitData,
  TradeTransactionData,
  TransactionData,
  UserData,
} from '../../services/firebase/models';
import { savePoolProfit } from '../../services/firebase/savePoolProfit';
import { saveUserData } from '../../services/firebase/saveUserData';
import { saveUserTransaction } from '../../services/firebase/saveUserTransaction';
import { makeTradeTransaction } from '../../testUtils/makeTradeTransaction';
import { getDate } from '../../utils/getDate';
import { getUniqueId } from '../../utils/getUniqueId';
import {
  calculateUserBalance,
  calculateUserTradeShare,
  handleSavePoolProfit,
  handleSaveUserTransactions,
  handleTrade,
} from './processTrade';

describe('processTrade', () => {
  describe('handleTrade', () => {
    it('calls onSavePoolProfit and onSaveUserTransactions with the args', async () => {
      const transactionId = getUniqueId();
      const data = makeTradeTransaction();
      const onSavePoolProfit = jest.fn();
      const onSaveUserTransactions = jest.fn();

      await handleTrade({
        transactionId,
        data,
        onSavePoolProfit,
        onSaveUserTransactions,
      });

      expect(onSavePoolProfit).toHaveBeenCalledWith({
        onGetTransactions: getTransactions,
        onSavePoolProfit: savePoolProfit,
      });
      expect(onSaveUserTransactions).toHaveBeenCalledWith({
        transactionId,
        data,
        onGetPoolBalance: getPoolBalance,
        onGetUsersWithBalances: getUsersWithBalances,
        onSaveUserTransaction: saveUserTransaction,
        onSaveUserData: saveUserData,
      });
    });
  });

  describe('handleSavePoolProfit', () => {
    it('does not update the pool profit if there are no transactions', async () => {
      const onGetTransactions = jest.fn(
        () => new Promise<TransactionData[]>((resolve) => resolve([])),
      );
      const onSavePoolProfit = jest.fn();
      await handleSavePoolProfit({
        onGetTransactions,
        onSavePoolProfit,
      });
      expect(onGetTransactions).toHaveBeenCalled();
      expect(onSavePoolProfit).not.toHaveBeenCalled();
    });

    it('updates the pool profit when there are transactions', async () => {
      const trade = makeTradeTransaction();
      const onGetTransactions = jest.fn(
        () => new Promise<TransactionData[]>((resolve) => resolve([trade])),
      );
      const onSavePoolProfit = jest.fn();

      await handleSavePoolProfit({
        onGetTransactions,
        onSavePoolProfit,
      });

      expect(onGetTransactions).toHaveBeenCalled();
      expect(onSavePoolProfit).toHaveBeenCalledWith({
        amount: trade.profitRatio,
        lastUpdated: '',
      });
    });
  });

  describe('calculateUserTradeShare', () => {
    it('works when the tradeAmount is 0', () => {
      const tradeAmount = 0;
      const userBalance = 10;
      const poolBalance = 100;
      const userTradeShare = calculateUserTradeShare({
        tradeAmount,
        userBalance,
        poolBalance,
      });

      expect(userTradeShare).toEqual(0);
    });

    it('works when the tradeAmount is not 0', () => {
      const tradeAmount = 1;
      const userBalance = 10;
      const poolBalance = 100;
      const userTradeShare = calculateUserTradeShare({
        tradeAmount,
        userBalance,
        poolBalance,
      });

      expect(userTradeShare).toEqual(0.1);
    });
  });

  describe('calculateUserBalance', () => {
    it('returns 0 when the new user balance is less than 0', () => {
      const userTradeShare = -1;
      const userBalance = 0;
      const newUserBalance = calculateUserBalance({
        userTradeShare,
        userBalance,
      });

      expect(newUserBalance).toEqual(0);
    });

    it('returns the original user balance when the trade amount is 0', () => {
      const userTradeShare = 0;
      const userBalance = 1;
      const newUserBalance = calculateUserBalance({
        userTradeShare,
        userBalance,
      });

      expect(newUserBalance).toEqual(userBalance);
    });

    it('works when the new user balance is positive', () => {
      const userTradeShare = 1;
      const userBalance = 1;
      const newUserBalance = calculateUserBalance({
        userTradeShare,
        userBalance,
      });

      expect(newUserBalance).toEqual(userBalance + userTradeShare);
    });
  });

  describe('handleSaveUserTransactions', () => {
    it('works correctly when there are no users with balances', async () => {
      const transactionId = getUniqueId();
      const data = makeTradeTransaction();
      const poolBalance = 1;
      const onGetPoolBalance = jest.fn(
        () => new Promise<number>((resolve) => resolve(poolBalance)),
      );
      const onGetUsersWithBalances = jest.fn(
        () =>
          new Promise<UserData[]>((resolve) =>
            resolve([
              // add user balances
            ]),
          ),
      );
      const onSaveUserTransaction = jest.fn();
      const onSaveUserData = jest.fn();

      await handleSaveUserTransactions({
        transactionId,
        data,
        onGetPoolBalance,
        onGetUsersWithBalances,
        onSaveUserTransaction,
        onSaveUserData,
      });

      expect(onGetPoolBalance).toHaveBeenCalled();
      expect(onGetUsersWithBalances).toHaveBeenCalled();
      expect(onSaveUserTransaction).not.toHaveBeenCalled();
      expect(onSaveUserData).not.toHaveBeenCalled();
    });

    it('works correctly when there are users with balances', async () => {
      const transactionId = getUniqueId();
      const data = makeTradeTransaction();
      const poolBalance = 1;
      const onGetPoolBalance = jest.fn(
        () => new Promise<number>((resolve) => resolve(poolBalance)),
      );
      const userBalance = 0.001;
      const uid = getUniqueId();
      const userData: UserData = {
        balance: userBalance,
        balanceLastUpdated: getDate(),
        id: uid,
      };
      const onGetUsersWithBalances = jest.fn(
        () => new Promise<UserData[]>((resolve) => resolve([userData])),
      );
      const onSaveUserTransaction = jest.fn();
      const onSaveUserData = jest.fn();

      await handleSaveUserTransactions({
        transactionId,
        data,
        onGetPoolBalance,
        onGetUsersWithBalances,
        onSaveUserTransaction,
        onSaveUserData,
      });

      expect(onGetPoolBalance).toHaveBeenCalled();
      expect(onGetUsersWithBalances).toHaveBeenCalled();

      const expectedUserTradeShare = calculateUserTradeShare({
        tradeAmount: data.amount,
        userBalance,
        poolBalance,
      });
      expect(onSaveUserTransaction).toHaveBeenCalledWith(uid, {
        ...data,
        amount: expectedUserTradeShare,
        transactionId,
      });
      expect(onSaveUserData).toHaveBeenCalledWith(uid, {
        balance: userBalance + expectedUserTradeShare,
        balanceLastUpdated: getDate(),
        id: uid,
      });
    });
  });
});
