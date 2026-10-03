export function intersection(arr1, arr2) {
  if (!Array.isArray(arr1) || !Array.isArray(arr2)) {
    return [];
  }

  const set2 = new Set(arr2);
  const result = [];
  const seen = new Set();

  for (const item of arr1) {
    if (set2.has(item) && !seen.has(item)) {
      result.push(item);
      seen.add(item);
      seen.add(item);
    }
  }

  return result;
}
