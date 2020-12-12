import * as camelcaseKeys from 'camelcase-keys';
import { firebase } from '.';
import { Trades, Trade, ParsedTrades } from '../bots/models';
import { getDate } from '../../utils/getDate';
import {
  MessagingTopics,
  TradeTransactionData,
  TransactionType,
} from './models';
import { saveTransaction } from './saveTransaction';
import { getTransactionExists } from './getTransactionExists';
import { sendNotification } from './sendNotification';

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

    const existingClosedTrade = existingTrades.filter(
      (trade) => trade.id === id && trade.closeTimestamp,
    )[0];

    const tradeIsNotOrder = trade.fee_open_cost;

    if (!existingClosedTrade && tradeIsNotOrder) {
      // opened trade that has been opened (we don't care about orders)
      const parsedTrade = camelcaseKeys(trade);
      await tradesRef.doc(id).set({
        ...parsedTrade,
        dateAdded: date,
      });

      // only do this once when the trade has just been opened
      const existingOpenedTrade = existingTrades.filter(
        (trade) => trade.id === id && !trade.closeTimestamp,
      )[0];

      if (!existingOpenedTrade) {
        await sendNotification({
          topic: MessagingTopics.openedTrades,
          data: trade,
        });
      }
    }

    if (existingClosedTrade && !trade.is_open) {
      // closed trade
      const tradeId = existingClosedTrade.id;
      const existingTransaction = await getTransactionExists(tradeId);

      if (!existingTransaction) {
        const tradeTransactionData: TradeTransactionData = {
          date,
          amount: existingClosedTrade.closeProfitAbs, // profit/loss
          type: TransactionType.TRADE,
          tradeId,
          profitRatio: existingClosedTrade.closeProfit,
        };

        await saveTransaction(tradeTransactionData, tradeId);

        await sendNotification({
          topic: MessagingTopics.closedTrades,
          data: trade,
        });
      }
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
