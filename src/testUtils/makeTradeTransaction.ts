import {
  TradeTransactionData,
  TransactionType,
} from '../services/firebase/models';
import { getDate } from '../utils/getDate';
import { getRandomNumber } from '../utils/getRandomNumber';
import { getUniqueId } from '../utils/getUniqueId';
import { toBTCDigits } from '../utils/toBTCDigits';

export const makeTradeTransaction = (): TradeTransactionData => {
  return {
    date: getDate(),
    amount: toBTCDigits(getRandomNumber(-0.001, 0.001)),
    type: TransactionType.TRADE,
    tradeId: getUniqueId(),
    profitRatio: getRandomNumber(-0.49, 0.49),
  };
};
