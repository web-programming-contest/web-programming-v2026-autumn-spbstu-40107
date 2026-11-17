export function findPairsWithSum(arr, sum) {
  const result = [];
  for (let i = 0; i < arr.length; i++) {
    for (let j = i + 1; j < arr.length; j++) {
      if (arr[i] + arr[j] === sum) {
        const a = Math.min(arr[i], arr[j]);
        const b = Math.max(arr[i], arr[j]);

        let exists = false;

        for (const pair of result) {
          if (pair[0] === a && pair[1] === b) {
            exists = true;
            break;
          }
        }

        if (!exists) {
          result.push([a, b]);
        }
      }
    }
  }

  return result;
}
