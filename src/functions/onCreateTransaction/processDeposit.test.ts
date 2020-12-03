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
  const depositAmount = 0.5010101;
  const data = makeDepositTransaction({ amount: depositAmount });
  const transactionId = getUniqueId();
  const currentUserBalance = 0;
  const currentPoolCommission = 0;
  const onSaveCommissionTransaction = jest.fn();
  const onSaveUserTransaction = jest.fn();
  const onUpdateUserBalance = jest.fn();
  const onUpdatePoolCommission = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('works correctly when the user is not an admin', async () => {
    const isUserAdmin = false;

    await handleDeposit({
      data,
      transactionId,
      currentUserBalance,
      isUserAdmin,
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

    const expectedUserData: Partial<UserData> = {
      balance: currentUserBalance + newAmount,
      balanceLastUpdated: date,
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

  it('works correctly when the user is an admin', async () => {
    const isUserAdmin = true;

    await handleDeposit({
      data,
      transactionId,
      currentUserBalance,
      isUserAdmin,
      currentPoolCommission,
      onSaveCommissionTransaction,
      onSaveUserTransaction,
      onUpdateUserBalance,
      onUpdatePoolCommission,
    });

    const date = '';

    const expectedUserData: Partial<UserData> = {
      balance: currentUserBalance + data.amount,
      balanceLastUpdated: date,
    };

    expect(onSaveCommissionTransaction).not.toHaveBeenCalled();
    expect(onSaveUserTransaction).toHaveBeenCalledWith(data.uid, data);
    expect(onUpdateUserBalance).toHaveBeenCalledWith(
      data.uid,
      expectedUserData,
    );
    expect(onUpdatePoolCommission).not.toHaveBeenCalled();
  });
});
