import { apiEndpoints } from '.';
import { getApiEndpoint } from './getApiEndpoint';
import { Balance } from './models';

export const getBalance = async (
  api: string,
  accessToken: string,
): Promise<Balance> => {
  const data = await getApiEndpoint<Balance>(
    `${api}/${apiEndpoints.balance}`,
    accessToken,
  );
  return data;
};
