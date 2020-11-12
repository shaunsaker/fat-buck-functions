import Axios from 'axios';
import { binanceApiEndpoints, binanceConfig } from '.';
import { getSignature } from './getSignature';
import { BinanceDepositHistoryResponse, BinanceDepositList } from './models';

export const getDepositHistory = async (): Promise<BinanceDepositList> => {
  const queryString = `timestamp=${Date.now()}`;
  const signature = getSignature(binanceConfig.apiSecret, queryString);
  const { data } = await Axios.get<BinanceDepositHistoryResponse>(
    `${binanceApiEndpoints.depositHistory}?${queryString}&signature=${signature}`,
    {
      headers: { 'X-MBX-APIKEY': binanceConfig.apiKey },
    },
  );
  return data.data;
};
