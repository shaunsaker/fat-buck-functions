import { getAccessToken } from '../services/bots/getAccessToken';
import { getBalance } from '../services/bots/getBalance';
import { getIsAlive } from '../services/bots/getIsAlive';
import { getOpenTrades } from '../services/bots/getOpenTrades';
import { getTrades } from '../services/bots/getTrades';
import { getActiveBots } from '../services/firebase/getActiveBots';
import { saveBalance } from '../services/firebase/saveBalance';
import { saveIsAlive } from '../services/firebase/saveIsAlive';
import { saveTrades } from '../services/firebase/saveTrades';

export const getBotsData = async (): Promise<null> => {
  console.log('Getting active bots.');
  const activeBots = await getActiveBots();

  for (const bot of activeBots) {
    // test if the server is up
    let isAlive = false;
    try {
      isAlive = await getIsAlive(bot.api);
    } catch (error) {
      // console.log('Server error.', error);
    }

    await saveIsAlive(bot.id, isAlive);

    if (!isAlive) {
      console.log('Not alive. Stopping.');
      continue;
    }

    const accessToken = await getAccessToken(bot.api);

    console.log('Getting trades.');
    const trades = await getTrades(bot.api, accessToken);
    console.log('Getting open trades.');
    const openTrades = await getOpenTrades(bot.api, accessToken); // aka open trades
    const allTrades = [...trades, ...openTrades];
    console.log('Saving trades.');
    await saveTrades(allTrades, bot.id);

    console.log('Getting balance.');
    const balance = await getBalance(bot.api, accessToken);
    console.log('Saving balance.');
    await saveBalance(balance);
  }

  return null;
};
