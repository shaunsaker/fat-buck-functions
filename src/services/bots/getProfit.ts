import { apiEndpoints } from '.';
import { getApiEndpoint } from './getApiEndpoint';
import { Profit } from './models';

export const getProfit = async (
  api: string,
  accessToken: string,
): Promise<Profit> => {
  const data = await getApiEndpoint<Profit>(
    `${api}/${apiEndpoints.profit}`,
    accessToken,
  );
  return data;
};
