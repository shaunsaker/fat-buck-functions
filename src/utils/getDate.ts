import moment from 'moment';

export const getDate = (timestamp?: number): string => {
  const date = moment(timestamp).toISOString();
  return date;
};
