import Axios from 'axios';
import { apiEndpoints } from '.';

export const getIsAlive = async (api: string): Promise<boolean> => {
  const {
    data: { status },
  } = await Axios.get(`${api}/${apiEndpoints.ping}`);

  return Boolean(status);
};
