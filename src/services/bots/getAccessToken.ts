import Axios from 'axios';
import { apiEndpoints } from '.';

export const getAccessToken = async (api: string): Promise<string> => {
  const {
    data: { access_token: accessToken },
  } = await Axios.post(
    `${api}/${apiEndpoints.login}`,
    {},
    {
      auth: {
        username: process.env.API_USERNAME,
        password: process.env.API_PASSWORD,
      },
    },
  );

  return accessToken;
};
