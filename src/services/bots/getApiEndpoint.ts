import Axios from 'axios';

export const getApiEndpoint = async <T>(
  endpoint: string, // FIXME: keyof typeof api
  accessToken: string,
): Promise<T> => {
  const { data } = await Axios.get(endpoint as string, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  return data;
};
