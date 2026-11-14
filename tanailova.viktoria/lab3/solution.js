export function sortByFrequency(arr) {
  const counts = new Map();
  arr.forEach((item) => counts.set(item, (counts.get(item) ?? 0) + 1));

  return [...counts]
    .sort(([, a], [, b]) => b - a)
    .flatMap(([item, count]) => Array(count).fill(item));
}
