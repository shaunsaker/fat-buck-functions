import { apiEndpoints } from '.';
import { getApiEndpoint } from './getApiEndpoint';
import { Trades } from './models';

export const getTrades = async (
  api: string,
  accessToken: string,
): Promise<Trades> => {
  const { trades } = await getApiEndpoint<{ trades: Trades }>(
    `${api}/${apiEndpoints.trades}`,
    accessToken,
  );
  return trades;
};
