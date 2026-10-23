import { useState } from 'react'
import CartTab from '../components/CartTab.jsx'
import OrderHistory from '../components/OrderHistory.jsx'
import './Cart.css'

const TABS = [
  { value: 'cart', label: 'Корзина' },
  { value: 'history', label: 'История заказов' },
]

function Cart() {
  const [tab, setTab] = useState('cart')

  return (
    <div className="page page--gray">
      <div className="container">
        <div className="tabs">
          {TABS.map((item) => (
            <button
              key={item.value}
              type="button"
              className={item.value === tab ? 'tabs__tab tabs__tab--active' : 'tabs__tab'}
              onClick={() => setTab(item.value)}
            >
              {item.label}
            </button>
          ))}
        </div>

        {tab === 'cart' ? <CartTab /> : <OrderHistory />}
      </div>
    </div>
  )
}

export default Cart
