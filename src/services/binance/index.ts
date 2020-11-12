const apiBase = 'https://api.binance.com';
export const binanceApiEndpoints = {
  depositHistory: `${apiBase}/wapi/v3/depositHistory.html`,
  withdrawalHistory: `${apiBase}/wapi/v3/withdrawHistory.html`,
};

export const binanceConfig = {
  apiKey: process.env.BINANCE_API_KEY as string,
  apiSecret: process.env.BINANCE_SECRET_KEY as string,
};
