import { randomise } from './randomise';

describe('randomise', () => {
  it('returns an empty array', () => {
    const array = [];
    const result = randomise(array);

    expect(result).toEqual(array);
  });

  it('returns a randomised array', () => {
    const array = [1, 2, 3, 4, 5];
    const result = randomise(array);

    expect(result).not.toEqual(array);
  });
});
