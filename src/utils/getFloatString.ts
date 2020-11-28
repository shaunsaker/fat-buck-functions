export const getFloatString = (value: number, digits = 2): string => {
  return Number(value).toFixed(digits);
};
