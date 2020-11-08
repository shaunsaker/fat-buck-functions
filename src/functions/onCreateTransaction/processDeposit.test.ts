import { getUniqueId } from '../../utils/getUniqueId';
import {
  CommissionTransactionData,
  PoolCommissionData,
  TransactionType,
  UserData,
} from '../../services/firebase/models';
import { handleDeposit } from './processDeposit';
import { makeDepositTransaction } from '../../testUtils/makeDepositTransaction';
import { deductCommission } from '../../utils/deductCommission';

describe('processDeposit', () => {
  it('works correctly', async () => {
    const depositAmount = 0.5010101;
    const data = makeDepositTransaction(depositAmount);
    const transactionId = getUniqueId();
    const currentUserBalance = 0;
    const currentPoolCommission = 0;
    const onSaveCommissionTransaction = jest.fn();
    const onSaveUserTransaction = jest.fn();
    const onUpdateUserBalance = jest.fn();
    const onUpdatePoolCommission = jest.fn();

    await handleDeposit({
      data,
      transactionId,
      currentUserBalance,
      currentPoolCommission,
      onSaveCommissionTransaction,
      onSaveUserTransaction,
      onUpdateUserBalance,
      onUpdatePoolCommission,
    });

    const { commission, newAmount } = deductCommission(depositAmount);
    const date = '';
    const expectedCommissionData: CommissionTransactionData = {
      date,
      amount: commission,
      type: TransactionType.COMMISSION,
      depositId: transactionId,
      uid: data.uid,
    };

    const expectedUserData: UserData = {
      balance: currentUserBalance + newAmount,
      balanceLastUpdated: date,
      id: data.uid,
    };

    const expectedPoolCommissionData: PoolCommissionData = {
      amount: currentPoolCommission + commission,
      lastUpdated: date,
    };

    expect(onSaveCommissionTransaction).toHaveBeenCalledWith(
      expectedCommissionData,
    );
    expect(onSaveUserTransaction).toHaveBeenCalledWith(
      data.uid,
      expectedCommissionData,
    );
    expect(onSaveUserTransaction).toHaveBeenCalledWith(data.uid, data);
    expect(onUpdateUserBalance).toHaveBeenCalledWith(
      data.uid,
      expectedUserData,
    );
    expect(onUpdatePoolCommission).toHaveBeenCalledWith(
      expectedPoolCommissionData,
    );
  });
});
