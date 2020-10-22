import { getDate } from '../utils/getDate';
import { getUniqueId } from '../utils/getUniqueId';
import { deductCommission } from './deductCommission';
import {
  CommissionTransactionData,
  DepositTransactionData,
  PoolCommissionData,
  TransactionType,
  UserData,
} from './models';
import { handleDeposit } from './processDeposit';

describe('processDeposit', () => {
  describe('handleDeposit', () => {
    it('works correctly', async () => {
      const uid = getUniqueId();
      const depositAmount = 0.5010101;
      const data: DepositTransactionData = {
        type: TransactionType.DEPOSIT,
        uid,
        walletAddress: getUniqueId(),
        depositCallId: getUniqueId(),
        binanceTransactionId: getUniqueId(),
        date: '',
        amount: depositAmount,
      };
      const transactionId = getUniqueId();
      const date = getDate();
      const onSaveCommission = jest.fn();
      const currentUserBalance = 0;
      const onUpdateUserBalance = jest.fn();
      const currentPoolCommission = 0;
      const onUpdatePoolCommission = jest.fn();

      await handleDeposit({
        data,
        transactionId,
        date,
        onSaveCommission,
        currentUserBalance,
        onUpdateUserBalance,
        currentPoolCommission,
        onUpdatePoolCommission,
      });

      const { commission, newAmount } = deductCommission(depositAmount);
      const expectedCommissionData: CommissionTransactionData = {
        date,
        amount: commission,
        type: TransactionType.COMMISSION,
        depositId: transactionId,
        uid,
      };

      const expectedUserData: UserData = {
        balance: currentUserBalance + newAmount,
        balanceLastUpdated: date,
      };

      const expectedPoolCommissionData: PoolCommissionData = {
        amount: currentPoolCommission + commission,
        lastUpdated: date,
      };

      expect(onSaveCommission).toHaveBeenCalledWith(expectedCommissionData);
      expect(onUpdateUserBalance).toHaveBeenCalledWith(
        data.uid,
        expectedUserData,
      );
      expect(onUpdatePoolCommission).toHaveBeenCalledWith(
        expectedPoolCommissionData,
      );
    });
  });
});
