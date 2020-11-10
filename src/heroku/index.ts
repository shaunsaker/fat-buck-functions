// Only use a local env file in dev
const isRunningOnHeroku = process.env.ON_HEROKU;
if (!isRunningOnHeroku) {
  require('dotenv').config();
}

import { getExchangeData } from './getExchangeData';
import { getBotsData } from './getBotsData';
import { handleDeposits } from './handleDeposits';
import { handleWithdrawals } from './handleWithdrawals';

const main = async () => {
  console.log('Starting.');

  await getBotsData();

  await getExchangeData();

  await handleDeposits();

  await handleWithdrawals();

  console.log('Done.');
  process.exit();
};

main();
