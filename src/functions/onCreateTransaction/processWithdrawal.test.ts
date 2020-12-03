import { getUserData } from '../../services/firebase/getUserData';
import { UserData } from '../../services/firebase/models';
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
        onGetUserData: getUserData,
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
      const onGetUserData = jest.fn(
        () =>
          new Promise<UserData>((resolve) =>
            resolve({ balance: userBalance, balanceLastUpdated: '', id: '' }),
          ),
      );
      const onSaveUserData = jest.fn();

      await handleUpdateUserBalance({
        data,
        onGetUserData,
        onSaveUserData,
      });

      expect(onGetUserData).toHaveBeenCalled();
      expect(onSaveUserData).toHaveBeenCalledWith(data.uid, {
        balance: userBalance - data.amount,
        balanceLastUpdated: getDate(),
        id: data.uid,
      });
    });
  });
});
