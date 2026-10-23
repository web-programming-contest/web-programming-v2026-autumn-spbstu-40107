const API_URL = 'http://localhost:8080'

async function request(path, options = {}) {
  const response = await fetch(API_URL + path, {
    ...options,
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
  })
  const data = await response.json()
  if (!response.ok) {
    throw new Error(data.message)
  }
  return data
}

export const getGoods = () => request('/goods')

export const login = (username, password) =>
  request('/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  })

export const logout = () => request('/logout', { method: 'POST' })

export const getMe = () => request('/me')

export const getOrders = () => request('/orders')

export const createOrder = (order) =>
  request('/orders', {
    method: 'POST',
    body: JSON.stringify(order),
  })
