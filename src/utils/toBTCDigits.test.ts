import { toBTCDigits } from './toBTCDigits';

describe('toBTCDigits', () => {
  it('returns 8 digits when the number has more than 8 digits', () => {
    const number = 1.123456789;
    const result = toBTCDigits(number);

    expect(result).toEqual(1.12345679);
  });
});
