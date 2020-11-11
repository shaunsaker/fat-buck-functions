import { DocumentSnapshot } from 'firebase-functions/lib/providers/firestore';
import { getUniqueId } from '../utils/getUniqueId';

export const makeFirestoreDocument = <T>({
  data,
  exists = true,
}: {
  data: T;
  exists?: boolean;
}): Partial<DocumentSnapshot> => ({
  exists,
  id: getUniqueId(),
  data: () => data,
});
