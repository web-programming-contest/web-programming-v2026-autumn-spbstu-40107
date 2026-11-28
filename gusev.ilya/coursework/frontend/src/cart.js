import {useRef, useState, useEffect} from 'react';

export function normalizeCart(value) {
  if (!Array.isArray(value)) {
    return [];
  }
  const result = new Map();
  for (const item of value) {
    if (
      item &&
      Number.isInteger(item.id) &&
      item.id > 0 &&
      Number.isInteger(item.quantity) &&
      item.quantity > 0
    ) {
      result.set(
        item.id,
        Math.min(99, (result.get(item.id) || 0) + item.quantity),
      );
    }
  }
  return [...result].map(([id, quantity]) => ({id, quantity}));
}
export function useCart(username) {
  const key = username ? `cart_${username}` : null;
  const read = () => {
    try {
      return key
        ? normalizeCart(JSON.parse(localStorage.getItem(key) || '[]'))
        : [];
    } catch {
      return [];
    }
  };
  const [cart, setCart] = useState(read);
  const current = useRef(cart);
  const [storageError, setStorageError] = useState('');
  const save = (value) => {
    current.current = normalizeCart(value);
    setCart(current.current);
    try {
      if (key) {
        if (current.current.length) {
          localStorage.setItem(key, JSON.stringify(current.current));
        } else {
          localStorage.removeItem(key);
        }
      }
      setStorageError('');
    } catch {
      setStorageError(
        'Браузер не разрешает сохранить корзину. Она доступна до закрытия страницы.',
      );
    }
  };
  useEffect(() => {
    const sync = (event) => {
      if (event.key === key || event.key === null) {
        current.current = read();
        setCart(current.current);
      }
    };
    window.addEventListener('storage', sync);
    return () => window.removeEventListener('storage', sync);
  }, [key]);
  return {
    cart,
    storageError,
    qtyOf: (id) => cart.find((i) => i.id === id)?.quantity || 0,
    setQty: (id, quantity) => {
      if (!key || !Number.isInteger(quantity)) {
        return;
      }
      const rest = current.current.filter((i) => i.id !== id);
      save(
        quantity > 0 ? [...rest, {id, quantity: Math.min(99, quantity)}] : rest,
      );
    },
    remove: (ids) => save(current.current.filter((i) => !ids.includes(i.id))),
    clear: () => save([]),
  };
}
