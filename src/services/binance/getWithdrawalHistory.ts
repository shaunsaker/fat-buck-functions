import Axios from 'axios';
import { binanceApiEndpoints, binanceConfig } from '.';
import { getSignature } from './getSignature';
import {
  BinanceWithdrawalHistoryResponse,
  BinanceWithdrawalList,
} from './models';

export const getWithdrawalHistory = async (): Promise<
  BinanceWithdrawalList
> => {
  const queryString = `timestamp=${Date.now()}`;
  const signature = getSignature(binanceConfig.apiSecret, queryString);
  const { data } = await Axios.get<BinanceWithdrawalHistoryResponse>(
    `${binanceApiEndpoints.withdrawalHistory}?${queryString}&signature=${signature}`,
    {
      headers: { 'X-MBX-APIKEY': binanceConfig.apiKey },
    },
  );
  return data.data;
};
