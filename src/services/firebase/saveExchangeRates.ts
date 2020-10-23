import { firebase } from '.';
import { ExchangeRatesData } from '../exchangeRates/models';
import { getDate } from '../../utils/getDate';

export const saveExchangeRates = async (
  exchangeRates: ExchangeRatesData,
): Promise<void> => {
  const date = getDate();

  for (const symbol in exchangeRates.rates) {
    const rate = exchangeRates.rates[symbol];
    await firebase.firestore().collection('exchangeRates').doc(symbol).set({
      base: 'USD',
      dateUpdated: date,
      symbol,
      rate,
    });
  }
};
