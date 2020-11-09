import Axios from 'axios';
import { binanceApiEndpoints, binanceConfig, getSignature } from '.';
import {
  BinanceWithdrawalHistoryResponse,
  BinanceWithdrawalList,
} from './models';

export const getWithdrawalHistory = async (): Promise<
  BinanceWithdrawalList
> => {
  const queryString = `timestamp=${Date.now()}`;
  const signature = getSignature(queryString);
  const { data } = await Axios.get<BinanceWithdrawalHistoryResponse>(
    `${binanceApiEndpoints.withdrawalHistory}?${queryString}&signature=${signature}`,
    {
      headers: { 'X-MBX-APIKEY': binanceConfig.apiKey },
    },
  );
  return data.data;
};
