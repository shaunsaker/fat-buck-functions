export const getRandomNumber = (min: number, max: number): number => {
  if (max < min) {
    return 0;
  }

  return Math.random() * (max - min) + min;
};
