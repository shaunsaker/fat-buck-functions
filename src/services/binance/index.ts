import * as crypto from 'crypto';

const apiBase = 'https://api.binance.com';
export const binanceApiEndpoints = {
  depositHistory: `${apiBase}/wapi/v3/depositHistory.html`,
};

export const binanceConfig = {
  apiKey: process.env.BINANCE_API_KEY as string,
  apiSecret: process.env.BINANCE_SECRET_KEY as string,
};

export const getSignature = (queryString: string): string => {
  // e.g. https://github.com/binance-exchange/binance-signature-examples/blob/master/nodejs/signature.js
  return crypto
    .createHmac('sha256', binanceConfig.apiSecret)
    .update(queryString)
    .digest('hex');
};
