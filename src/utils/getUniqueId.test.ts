import { getUniqueId } from './getUniqueId';

describe('getUniqueId', () => {
  it('returns a unique id', () => {
    const idA = getUniqueId();
    const idB = getUniqueId();

    expect(idA).toEqual(expect.any(String));
    expect(idB).toEqual(expect.any(String));
    expect(idA).not.toEqual(idB);
  });
});
