// rounds a number to 8 decimal places
export const toBTCDigits = (number: number): number => {
  return parseFloat(number.toFixed(8));
};
