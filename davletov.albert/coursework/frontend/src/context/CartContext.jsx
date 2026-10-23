import { createContext, useContext, useEffect, useState } from 'react'

const STORAGE_KEY = 'cart'

const CartContext = createContext(null)

const loadCart = () => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) ?? []
  } catch {
    return []
  }
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(loadCart)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  }, [items])

  const getQuantity = (id) => items.find((item) => item.id === id)?.quantity ?? 0

  const add = (product) => {
    setItems((prev) => [
      ...prev,
      {
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        quantity: 1,
      },
    ])
  }

  const increase = (id) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, quantity: item.quantity + 1 } : item)),
    )
  }

  const decrease = (id) => {
    setItems((prev) =>
      prev
        .map((item) => (item.id === id ? { ...item, quantity: item.quantity - 1 } : item))
        .filter((item) => item.quantity > 0),
    )
  }

  const remove = (ids) => {
    setItems((prev) => prev.filter((item) => !ids.includes(item.id)))
  }

  const clear = () => setItems([])

  const count = items.reduce((sum, item) => sum + item.quantity, 0)
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0)

  return (
    <CartContext.Provider
      value={{ items, count, total, getQuantity, add, increase, decrease, remove, clear }}
    >
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => useContext(CartContext)
