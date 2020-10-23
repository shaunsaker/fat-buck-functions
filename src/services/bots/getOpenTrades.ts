import { apiEndpoints } from '.';
import { getApiEndpoint } from './getApiEndpoint';
import { Trades } from './models';

export const getOpenTrades = async (
  api: string,
  accessToken: string,
): Promise<any[]> => {
  const data = await getApiEndpoint<Trades[] | undefined>(
    `${api}/${apiEndpoints.status}`,
    accessToken,
  );
  return data || [];
};
