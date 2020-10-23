import { getExchangeRates } from '../services/exchangeRates/getExchangeRates';
import { saveExchangeRates } from '../services/firebase/saveExchangeRates';

export const getExchangeData = async (): Promise<null> => {
  console.log('Getting exchange rates.');
  const exchangeRates = await getExchangeRates();
  console.log('Saving exchange rates.');
  await saveExchangeRates(exchangeRates);

  return null;
};
