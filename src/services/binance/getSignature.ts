import * as crypto from 'crypto';

export const getSignature = (
  apiSecret: string,
  queryString: string,
): string => {
  // e.g. https://github.com/binance-exchange/binance-signature-examples/blob/master/nodejs/signature.js
  return crypto
    .createHmac('sha256', apiSecret)
    .update(queryString)
    .digest('hex');
};
