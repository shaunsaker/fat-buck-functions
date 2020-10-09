import { v4 as uuid } from 'uuid';

export const getUniqueId = (): string => {
  const uniqueId = uuid();
  return uniqueId;
};
