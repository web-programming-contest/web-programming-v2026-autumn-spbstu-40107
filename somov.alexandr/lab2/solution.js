export function findMissingNumber(arr) {
  const max = arr.length + 1;
  const expectedSum = (max * (max + 1)) / 2;
  return expectedSum - arr.reduce((sum, value) => sum + value, 0);
}
