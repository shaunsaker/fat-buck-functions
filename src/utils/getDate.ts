import moment from 'moment';

export const getDate = (): string => {
  return moment().toISOString();
};
