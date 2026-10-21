export function zipArrays(...arrays: unknown[][]): unknown[][] {
  if (arrays.length === 0) {
    return [];
  }

  const minLength = Math.min(...arrays.map((arr) => arr.length));
  const result: unknown[][] = [];

  for (let i = 0; i < minLength; i++) {
    result.push(arrays.map((arr) => arr[i]));
  }

  return result;
}
