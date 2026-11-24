export function findMostFrequent(arr) {
  if (arr.length === 0) {
    return undefined;
  }

  const counts = new Map();
  let mostFrequent;
  let maxCount = 0;

  for (const item of arr) {
    const count = (counts.get(item) || 0) + 1;
    counts.set(item, count);

    if (count > maxCount) {
      maxCount = count;
      mostFrequent = item;
    }
  }

  return mostFrequent;
}
