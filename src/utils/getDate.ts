const moment = require('moment');

export const getDate = (): string => {
  return moment().toISOString();
};
