export const PAGE_SIZE = 9;
export const emptyFilters = {priceFrom: '', priceTo: '', types: [], colors: []};

export function filterGoods(goods, filters, sortBy, direction) {
  const result = goods.filter((item) =>
    (filters.priceFrom === '' || item.price >= Number(filters.priceFrom)) &&
    (filters.priceTo === '' || item.price <= Number(filters.priceTo)) &&
    (!filters.types.length || filters.types.includes(item.type)) &&
    (!filters.colors.length || filters.colors.includes(item.color)),
  );

  return result.sort((a, b) => {
    const difference = sortBy === 'createdAt'
      ? a.createdAt.localeCompare(b.createdAt)
      : a[sortBy] - b[sortBy];
    return (direction === 'asc' ? difference : -difference) || a.id - b.id;
  });
}

export function pageNumbers(total, current) {
  const numbers = [...new Set([1, 2, 3, current, total])]
    .filter((page) => page >= 1 && page <= total)
    .sort((a, b) => a - b);
  return numbers.flatMap((page, index) =>
    index && page - numbers[index - 1] > 1 ? ['…', page] : [page],
  );
}

export function formatPrice(value) {
  return `${value.toLocaleString('ru-RU')} ₽`;
}
