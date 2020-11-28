import { firebase } from '.';
import { Trade } from '../bots/models';
import { MessagingTopics } from './models';
import { getFloatString } from '../../utils/getFloatString';

export const sendNotification = async ({
  topic,
  trade,
}: {
  topic: MessagingTopics;
  trade: Trade;
}): Promise<void> => {
  let title;
  let body;

  if (topic === MessagingTopics.openedTrades) {
    title = `Fat Buck just bought ${trade.pair}.`;
    body = "Let's make it rain!";
  } else {
    const isProfit = trade.close_profit_abs >= 0;

    title = `Fat Buck just sold ${trade.pair}.`;
    body = `We made a ${getFloatString(trade.close_profit_abs)}% ${
      isProfit ? 'profit' : 'loss'
    }!`;
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
