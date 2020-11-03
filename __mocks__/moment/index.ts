export const MOCKED_MOMENT_ISO_STRING = '2018-08-26T19:17:02.349Z';

const mockedMoment = (): any =>
  jest.requireActual('moment')(MOCKED_MOMENT_ISO_STRING);

export default mockedMoment;
