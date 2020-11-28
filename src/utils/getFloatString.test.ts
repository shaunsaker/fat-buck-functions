import { getFloatString } from './getFloatString';

describe('getFloatString', () => {
  it('returns a string fixed to 2 decimals by default', () => {
    const result = getFloatString(1);
    const expected = '1.00';
    expect(result).toEqual(expected);
  });

  it('returns a string fixed to X decimals', () => {
    const result = getFloatString(1, 8);
    const expected = '1.00000000';
    expect(result).toEqual(expected);
  });
});
