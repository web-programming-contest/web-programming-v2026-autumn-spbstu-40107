export function countOccurrences(array) {
  const counts = {};

  for (const item of array) {
    const key = String(item);
    counts[key] = (counts[key] || 0) + 1;
  }

  return counts;
}
