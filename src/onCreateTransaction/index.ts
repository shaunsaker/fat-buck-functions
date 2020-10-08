import * as functions from 'firebase-functions';
import { admin } from '../admin';
import { getDate } from '../utils/getDate';
import { toBTCDigits } from '../utils/toBTCDigits';
import { deductCommission } from './deductCommission';
import {
  CommissionTransactionData,
  TransactionData,
  TransactionType,
  UserData,
  PoolBalanceData,
} from './models';

// TODO: before we set these amounts, we should run an audit to make sure all transactions are accounted for in the pool balance
export const onCreateTransaction = functions.firestore
  .document('transactions/{transactionId}')
  .onCreate(async (snap, context) => {
    // if it's a deposit, take commission, update pool balance (includes commission), update user balance (excludes commission)
    const data = snap.data() as TransactionData;

    if (data.type === TransactionType.DEPOSIT) {
      const { amount, uid } = data;
      const commissionPercentage = 2.5; // CFO: should we get this from somewhere remote in case we need to update it?
      const { newAmount, commission } = deductCommission(
        amount,
        commissionPercentage,
      );
      const date = getDate();

      // save the commission as a new transaction
      const commissionTransactionData: CommissionTransactionData = {
        date,
        amount: commission,
        type: TransactionType.COMMISSION,
        depositId: context.params.transactionId,
        uid,
      };

      console.log('Saving commission transaction.');
      await admin
        .firestore()
        .collection('transactions')
        .doc()
        .set(commissionTransactionData);

      // update the user's balance
      const userRef = admin.firestore().collection('users').doc(uid);
      const initialUserBalance = toBTCDigits(0);
      const { balance: currentUserBalance = initialUserBalance } = (await (
        await userRef.get()
      ).data()) as UserData;
      const newUserBalance = toBTCDigits(currentUserBalance + newAmount);

      console.log('Updating user balance.');
      await admin
        .firestore()
        .collection('users')
        .doc(uid)
        .update({ balance: newUserBalance, balanceLastUpdated: date });

      // update the admin balance
      const poolRef = admin.firestore().collection('pool').doc('balance');
      const { amount: currentPoolBalance } = (await (
        await poolRef.get()
      ).data()) as PoolBalanceData;
      const newPoolBalance = currentPoolBalance + commission;

      console.log('Updating pool balance.');
      await poolRef.update({
        amount: newPoolBalance,
        lastUpdated: date,
      });
    }
  });
