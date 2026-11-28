export function filterGoods(goods, filters) {
  const min = filters.min === '' ? 0 : Number(filters.min);
  const max = filters.max === '' ? Infinity : Number(filters.max);
  return goods.filter(
    (good) =>
      good.price >= min &&
      good.price <= max &&
      (!filters.types.length || filters.types.includes(good.type)) &&
      (!filters.colors.length || filters.colors.includes(good.color)),
  );
}

export function sortGoods(goods, criterion, direction) {
  const score =
    criterion === 'price'
      ? (good) => good.price
      : criterion === 'popular'
        ? (good) => good.popularity
        : (good) => Number(good.isNew);
  const sign = direction === 'asc' ? 1 : -1;
  return [...goods].sort((a, b) => (score(a) - score(b)) * sign || a.id - b.id);
}

export function pageNumbers(count) {
  return count > 3
    ? [1, 2, 3, '…', count]
    : Array.from({length: count}, (_, index) => index + 1);
}
