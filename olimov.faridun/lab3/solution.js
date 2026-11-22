export function intersection(arr1, arr2) {
  if (!Array.isArray(arr1) || !Array.isArray(arr2)) {
    return [];
  }

  const values2 = new Set(arr2);
  const common = arr1.filter((item) => values2.has(item));

  return [...new Set(common)];
}
