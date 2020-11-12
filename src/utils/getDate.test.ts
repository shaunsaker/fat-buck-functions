import { getDate } from './getDate';

describe('getDate', () => {
  it('returns an ISO string when no timestamp is provided', () => {
    expect(getDate()).toEqual(''); // is mocked
  });

  it('returns an ISO string when a timestamp is provided', () => {
    expect(getDate(1605162865685)).toEqual(''); // is mocked
  });
});
