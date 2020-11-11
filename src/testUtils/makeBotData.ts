import { BotData } from '../services/firebase/models';
import { getDate } from '../utils/getDate';
import { getUniqueId } from '../utils/getUniqueId';

export const makeBotData = ({
  isAlive = true,
}: {
  isAlive?: boolean;
}): BotData => ({
  id: getUniqueId(),
  api: getUniqueId(),
  dateUpdated: getDate(),
  isActive: true,
  isAlive,
});
