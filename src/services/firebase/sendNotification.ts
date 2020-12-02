import { firebase } from '.';
import { Trade } from '../bots/models';
import { DepositTransactionData, MessagingTopics } from './models';
import { getFloatString } from '../../utils/getFloatString';
import { toBTCDigits } from '../../utils/toBTCDigits';

export const sendNotification = async ({
  topic,
  data,
}: {
  topic: MessagingTopics;
  data: Trade | DepositTransactionData;
}): Promise<void> => {
  let title;
  let body;

  if (topic === MessagingTopics.openedTrades) {
    const trade = data as Trade;
    title = `Fat Buck just bought ${trade.pair}.`;
    body = "Let's make it rain!";
  } else if (topic === MessagingTopics.closedTrades) {
    const trade = data as Trade;
    const isProfit = trade.close_profit_abs >= 0;

    title = `Fat Buck just sold ${trade.pair}.`;
    body = `We made a ${getFloatString(trade.close_profit * 100)}% ${
      isProfit ? 'profit' : 'loss'
    }!`;
  } else if (topic === MessagingTopics.depositSuccess) {
    const deposit = data as DepositTransactionData;
    title = 'Your deposit was successful.';
    body = `${toBTCDigits(
      deposit.amount,
    )} BTC was successfully transferred to your Fat Buck wallet.`;
  } else {
    return;
  }

  const payload = {
    notification: {
      title,
      body,
    },
    topic,
  };

  console.log('Sending notification...');

  try {
    const response = await firebase.messaging().send(payload);

    console.log(`Successfully sent notification: ${response}`);
  } catch (error) {
    console.log(error.message);
  }

  return;
};
