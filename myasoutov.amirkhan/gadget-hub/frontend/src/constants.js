export const API_URL = 'http://localhost:8080';
export const SESSION_STORAGE_KEY = 'gadget_hub_session';
export const CART_STORAGE_PREFIX = 'gadget_hub_cart_';

export const PAGE_PATHS = {
  home: '/',
  login: '/login',
  catalog: '/catalog',
  cart: '/cart'
};

export const PRODUCT_TYPES = [
  'Смартфоны',
  'Фитнес браслеты',
  'Портативная акустика',
  'Очки виртуальной реальности',
  'Электротранспорт',
  'Умные часы',
  'Наушники',
  'Аксессуары'
];

export const PRODUCT_COLORS = [
  'Красный',
  'Оранжевый',
  'Желтый',
  'Зеленый',
  'Голубой',
  'Синий',
  'Фиолетовый',
  'Черный',
  'Белый',
  'Серый'
];

export const cartStorageKey = (username) => `${CART_STORAGE_PREFIX}${username}`;

export const pluralizeGoods = (count) => {
  const lastTwo = count % 100;
  const lastOne = count % 10;
  if (lastOne === 1 && lastTwo !== 11) return 'товар';
  if (lastOne >= 2 && lastOne <= 4 && (lastTwo < 12 || lastTwo > 14)) return 'товара';
  return 'товаров';
};

export const readSession = () => {
  try {
    const parsed = JSON.parse(localStorage.getItem(SESSION_STORAGE_KEY));
    return parsed && parsed.token && parsed.username ? parsed : null;
  } catch {
    return null;
  }
};

export const readCart = (username) => {
  if (!username) return [];
  try {
    const saved = localStorage.getItem(cartStorageKey(username));
    const items = saved ? JSON.parse(saved) : [];
    if (!Array.isArray(items)) return [];
    return items.map((item) => ({
      id: item.id,
      quantity: item.quantity,
      checked: item.checked !== false
    }));
  } catch {
    return [];
  }
};

export const authHeaders = (token, withJson = false) => ({
  ...(withJson ? { 'Content-Type': 'application/json' } : {}),
  Authorization: `Bearer ${token}`
});
