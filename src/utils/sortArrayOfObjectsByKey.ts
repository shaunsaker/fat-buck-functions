// sorts an array of objects by key
// with optional reverse order functionality
export const sortArrayOfObjectsByKey = (
  array: any[],
  key: string,
  reverseOrder?: boolean,
): any[] => {
  const newArray = [...array];
  const sortedArray = newArray.sort((a, b) => {
    return a[key] > b[key] ? (reverseOrder ? -1 : 1) : reverseOrder ? 1 : -1;
  });
  return sortedArray;
};