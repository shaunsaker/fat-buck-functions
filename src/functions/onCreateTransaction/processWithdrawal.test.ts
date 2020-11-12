import { getUserBalance } from '../../services/firebase/getUserBalance';
import { saveUserData } from '../../services/firebase/saveUserData';
import { makeWithdrawalTransaction } from '../../testUtils/makeWithdrawalTransaction';
import { getDate } from '../../utils/getDate';
import { handleUpdateUserBalance, handleWithdrawal } from './processWithdrawal';

describe('processWithdrawal', () => {
  describe('handleWithdrawal', () => {
    it('calls onUpdateUserBalance with the args', async () => {
      const data = makeWithdrawalTransaction({});
      const onUpdateUserBalance = jest.fn();

      await handleWithdrawal({
        data,
        onUpdateUserBalance,
      });

      expect(onUpdateUserBalance).toHaveBeenCalledWith({
        data,
        onGetUserBalance: getUserBalance,
        onSaveUserData: saveUserData,
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
