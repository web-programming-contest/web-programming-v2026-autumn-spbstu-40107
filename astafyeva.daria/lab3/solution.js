/**
 * Возвращает новый массив, в котором все нули перенесены в конец,
 * а остальные элементы сохраняют исходный порядок.
 * Исходный массив не изменяется.
 * @param {unknown[]} arr
 * @returns {unknown[]}
 */
export function moveZerosToEnd(arr) {
  if (!Array.isArray(arr)) {
    throw new TypeError('Ожидается массив');
  }

  const nonZeros = [];
  const zeros = [];

  for (const item of arr) {
    if (item === 0) {
      zeros.push(item);
    } else {
      nonZeros.push(item);
    }
  }

  return [...nonZeros, ...zeros];
}
