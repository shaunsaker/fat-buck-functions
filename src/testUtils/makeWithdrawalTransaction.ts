import { BINANCE_WITHDRAWAL_FEE } from '../services/binance/models';
import {
  TransactionData,
  TransactionType,
  WithdrawalTransactionData,
} from '../services/firebase/models';
import { getBalanceFromTransactions } from '../utils/getBalanceFromTransactions';
import { getDate } from '../utils/getDate';
import { getRandomNumber } from '../utils/getRandomNumber';
import { getUniqueId } from '../utils/getUniqueId';
import { toBTCDigits } from '../utils/toBTCDigits';

export const makeWithdrawalTransaction = ({
  transactions,
  amount,
  walletAddress,
  withdrawalCallId,
  txId,
}: {
  transactions?: TransactionData[];
  amount?: number;
  walletAddress?: string;
  withdrawalCallId?: string;
  txId?: string;
}): WithdrawalTransactionData => {
  // use the existing transactions (if available) to make sure we don't withdraw more than is available
  const availableBalance = transactions
    ? getBalanceFromTransactions(transactions)
    : toBTCDigits(getRandomNumber(0.001, 1));
  const amountToUse =
    amount || toBTCDigits(getRandomNumber(0, availableBalance));
  const resolvedAmount = toBTCDigits(amountToUse - BINANCE_WITHDRAWAL_FEE);

  return {
    date: getDate(),
    amount: amountToUse,
    type: TransactionType.WITHDRAWAL,
    uid: getUniqueId(),
    walletAddress: walletAddress || getUniqueId(),
    withdrawalCallId: withdrawalCallId || getUniqueId(),
    txId: txId || getUniqueId(),
    transactionFee: BINANCE_WITHDRAWAL_FEE,
    resolvedAmount,
  };
};
