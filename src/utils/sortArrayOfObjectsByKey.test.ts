import { sortArrayOfObjectsByKey } from './sortArrayOfObjectsByKey';

describe('sortArrayOfObjectsByKey', () => {
  const array = [
    {
      name: 'Z',
    },
    {
      name: 'A',
    },
    {
      name: 'T',
    },
  ];

  it('sorts an array of objects from smallest to largest', () => {
    const result = sortArrayOfObjectsByKey(array, 'name');
    expect(result[0]).toEqual(array[1]);
    expect(result[2]).toEqual(array[0]);
  });

  it('sorts an array of objects from largest to smallest', () => {
    const result = sortArrayOfObjectsByKey(array, 'name', true);
    expect(result[0]).toEqual(array[0]);
    expect(result[2]).toEqual(array[1]);
  });
});
