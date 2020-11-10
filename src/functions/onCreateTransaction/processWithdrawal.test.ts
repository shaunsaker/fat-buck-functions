import { getPoolBalance } from '../../services/firebase/getPoolBalance';
import { getUserBalance } from '../../services/firebase/getUserBalance';
import { savePoolBalance } from '../../services/firebase/savePoolBalance';
import { saveUserData } from '../../services/firebase/saveUserData';
import { makeWithdrawalTransaction } from '../../testUtils/makeWithdrawalTransaction';
import { getDate } from '../../utils/getDate';
import {
  handleUpdatePoolBalance,
  handleUpdateUserBalance,
  handleWithdrawal,
} from './processWithdrawal';

describe('processWithdrawal', () => {
  describe('handleWithdrawal', () => {
    it('calls onUpdatePoolBalance and onUpdateUserBalance with the args', async () => {
      const data = makeWithdrawalTransaction({});
      const onUpdatePoolBalance = jest.fn();
      const onUpdateUserBalance = jest.fn();

      await handleWithdrawal({
        data,
        onUpdatePoolBalance,
        onUpdateUserBalance,
      });

      expect(onUpdatePoolBalance).toHaveBeenCalledWith({
        data,
        onGetPoolBalance: getPoolBalance,
        onSavePoolBalance: savePoolBalance,
      });
      expect(onUpdateUserBalance).toHaveBeenCalledWith({
        data,
        onGetUserBalance: getUserBalance,
        onSaveUserData: saveUserData,
      });
    });
  });

  describe('handleUpdatePoolBalance', () => {
    it('works correctly', async () => {
      const poolBalance = 1;
      const data = makeWithdrawalTransaction({
        amount: 0.5, // less than pool balance
      });
      const onGetPoolBalance = jest.fn(
        () => new Promise<number>((resolve) => resolve(poolBalance)),
      );
      const onSavePoolBalance = jest.fn();

      await handleUpdatePoolBalance({
        data,
        onGetPoolBalance,
        onSavePoolBalance,
      });

      expect(onGetPoolBalance).toHaveBeenCalled();
      expect(onSavePoolBalance).toHaveBeenCalledWith({
        amount: poolBalance - data.amount,
        lastUpdated: getDate(),
      });
    });
  });

  describe('handleUpdateUserBalance', () => {
    it('works correctly', async () => {
      const userBalance = 1;
      const data = makeWithdrawalTransaction({
        amount: 0.5, // less than user balance
      });
      const onGetUserBalance = jest.fn(
        () => new Promise<number>((resolve) => resolve(userBalance)),
      );
      const onSaveUserData = jest.fn();

      await handleUpdateUserBalance({
        data,
        onGetUserBalance,
        onSaveUserData,
      });

      expect(onGetUserBalance).toHaveBeenCalled();
      expect(onSaveUserData).toHaveBeenCalledWith(data.uid, {
        balance: userBalance - data.amount,
        balanceLastUpdated: getDate(),
        id: data.uid,
      });
    });
  });
});
