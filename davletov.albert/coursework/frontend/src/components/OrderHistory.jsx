import { useEffect, useState } from 'react'
import { getOrders } from '../api.js'
import { formatCount, formatDate, formatPrice } from '../utils/format.js'
import './OrderHistory.css'

function OrderHistory() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    getOrders()
      .then((data) => setOrders(data.reverse()))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return <p>Загрузка...</p>
  }
  if (error) {
    return <p className="order-history__message">{error}</p>
  }
  if (orders.length === 0) {
    return <p className="order-history__message">Вы еще ничего не заказывали</p>
  }

  return (
    <ul className="panel order-history">
      {orders.map((order) => (
        <li key={order.id} className="order-history__item">
          <span className="order-history__number">
            № {order.id} от {formatDate(order.date)}
          </span>
          <span>{formatCount(order.count)}</span>
          <span className="order-history__total">{formatPrice(order.total)}</span>
        </li>
      ))}
    </ul>
  )
}

export default OrderHistory
