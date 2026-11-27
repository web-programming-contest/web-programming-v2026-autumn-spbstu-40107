import {createContext, useContext, useEffect, useState} from 'react';
import {removeOrderedItems} from '../cart.js';

const CartContext = createContext(null);
const STORAGE_KEY = 'gadget-hub:cart:1';

function readCart() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    if (!Array.isArray(saved)) return [];
    return saved.filter((item) =>
      item && Number.isInteger(item.productId) &&
      Number.isInteger(item.quantity) && item.quantity > 0,
    );
  } catch {
    return [];
  }
}

// Один источник количества для каталога, модального окна и страницы корзины.
export function CartProvider({children}) {
  const [items, setItems] = useState(readCart);
  const [storageError, setStorageError] = useState('');

  useEffect(() => {
    try {
      if (items.length) localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
      else localStorage.removeItem(STORAGE_KEY);
      setStorageError('');
    } catch {
      setStorageError('Браузер не разрешил сохранить корзину. Она доступна до обновления страницы.');
    }
  }, [items]);

  function updateQuantity(productId, change) {
    setItems((current) => {
      const quantity = change(current.find((item) => item.productId === productId)?.quantity || 0);
      const next = current.filter((item) => item.productId !== productId);
      if (quantity > 0) next.push({productId, quantity});
      return next;
    });
  }

  const getQuantity = (productId) => items.find((item) => item.productId === productId)?.quantity || 0;
  const value = {
    items, getQuantity, storageError,
    setQuantity: (id, quantity) => updateQuantity(id, () => quantity),
    addItem: (id) => updateQuantity(id, (quantity) => quantity + 1),
    removeItem: (id) => updateQuantity(id, () => 0),
    removeSelected: (ids) => setItems((current) => current.filter((item) => !ids.includes(item.productId))),
    removeOrdered: (ordered) => setItems((current) => removeOrderedItems(current, ordered)),
    clearCart: () => setItems([]),
    totalQuantity: items.reduce((sum, item) => sum + item.quantity, 0),
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export const useCart = () => useContext(CartContext);
