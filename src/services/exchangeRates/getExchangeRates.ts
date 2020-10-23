import Axios from 'axios';
import { ExchangeRatesData } from './models';

export const getExchangeRates = async (): Promise<ExchangeRatesData> => {
  const { data } = await Axios.get<ExchangeRatesData>(
    'https://api.exchangeratesapi.io/latest?base=USD',
  );

  return data;
};
