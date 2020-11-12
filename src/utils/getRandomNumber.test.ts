import { getRandomNumber } from './getRandomNumber';

describe('getRandomNumber', () => {
  it('returns 0 if max is smaller than min', () => {
    const min = 10;
    const max = 1;
    const result = getRandomNumber(min, max);

    expect(result).toEqual(0);
  });

  it('returns a random number between min and max', () => {
    const min = 1;
    const max = 10;
    const result = getRandomNumber(min, max);

    expect(result).toBeGreaterThanOrEqual(min);
    expect(result).toBeLessThanOrEqual(max);
  });
});
