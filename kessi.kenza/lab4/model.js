export class Product {
  constructor(id, name, categories, price) {
    this.id = id;
    this.name = name;
    this.categories = [...categories];
    this.price = price;
  }

  addCategory(category) {
    if (!this.categories.includes(category)) {
      this.categories.push(category);
    }
  }

  removeCategory(category) {
    this.categories = this.categories.filter((item) => item !== category);
  }

  get categoryCount() {
    return this.categories.length;
  }
}

export function groupProductsByCategory(products) {
  const grouped = {};
  for (const product of products) {
    for (const category of product.categories) {
      if (!grouped[category]) {
        grouped[category] = [];
      }
      grouped[category].push(product);
    }
  }
  return grouped;
}

export function getUniqueCategories(products) {
  const all = products.flatMap((product) => product.categories);
  return [...new Set(all)];
}

const PRICE_RANGES = [
  {label: '0-1000', min: 0, max: 1000},
  {label: '1000-10000', min: 1000, max: 10000},
  {label: '10000-50000', min: 10000, max: 50000},
  {label: '50000+', min: 50000, max: Infinity},
];

export function groupProductsByPriceRange(products) {
  const grouped = Object.fromEntries(
    PRICE_RANGES.map((range) => [range.label, []]),
  );
  for (const product of products) {
    const range = PRICE_RANGES.find(
      (item) => product.price >= item.min && product.price < item.max,
    );
    grouped[range.label].push(product);
  }
  return grouped;
}

export function findProductsByCategory(products, category) {
  return products.filter((product) => product.categories.includes(category));
}

export function findProductsAbovePrice(products, minPrice) {
  return products.filter((product) => product.price > minPrice);
}
