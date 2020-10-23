import * as camelcaseKeys from 'camelcase-keys';
import { firebase } from '.';
import { Trades, Trade, ParsedTrades } from '../bots/models';
import { getDate } from '../../utils/getDate';
import { TradeTransactionData, TransactionType } from './models';
import { saveTransaction } from './saveTransaction';

const getTradeId = (botId: string, trade: Trade): string => {
  const coin = trade.pair.split('/')[0];
  const tradeId = `${botId}-${trade.open_timestamp}-${coin}`;
  return tradeId;
};

export const saveTrades = async (
  trades: Trades,
  botId: string,
): Promise<void> => {
  const date = getDate();
  const tradesRef = firebase
    .firestore()
    .collection('bots')
    .doc(botId)
    .collection('trades');

  const existingTrades = (await (await tradesRef.get()).docs.map((doc) => ({
    ...doc.data(),
    id: doc.id,
  }))) as ParsedTrades;

  for (const trade of trades) {
    const id = getTradeId(botId, trade);
    const existingTrade = existingTrades.filter(
      (trade) => trade.id === id && trade.closeTimestamp,
    )[0];

    if (!existingTrade) {
      const parsedTrade = camelcaseKeys(trade);
      await tradesRef.doc(id).set({
        ...parsedTrade,
        dateAdded: date,
      });
    }

    if (existingTrade && !trade.is_open) {
      // closed trade, save the trade as transaction
      const tradeTransactionData: TradeTransactionData = {
        date,
        amount: existingTrade.closeProfitAbs, // profit/loss
        type: TransactionType.TRADE,
        tradeId: existingTrade.id,
      };

      await saveTransaction(tradeTransactionData);
    }
  }

  // if an open trade with no feeOpenCost is in Firestore and is no longer in trades, assume it was cancelled and remove it from Firestore
  for (const existingTrade of existingTrades) {
    if (
      existingTrade.isOpen &&
      !existingTrade.feeOpenCost &&
      !trades.some((trade) => getTradeId(botId, trade) === existingTrade.id)
    ) {
      `Removing cancelled trade: ${existingTrade.id}`;
      await tradesRef.doc(existingTrade.id).delete();
    }
  }
};
