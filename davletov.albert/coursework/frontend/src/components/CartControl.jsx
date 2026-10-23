import { useNavigate } from 'react-router'
import { useAuth } from '../context/AuthContext.jsx'
import { useCart } from '../context/CartContext.jsx'
import Button from './Button.jsx'
import Counter from './Counter.jsx'
import './CartControl.css'

const CART_ICON = '/images/icons/card-white.svg'

function CartControl({ product, full = false }) {
  const { user } = useAuth()
  const { getQuantity, add, increase, decrease } = useCart()
  const navigate = useNavigate()
  const quantity = getQuantity(product.id)

  if (!user) {
    return (
      <Button icon={CART_ICON} onClick={() => navigate('/login')}>
        В корзину
      </Button>
    )
  }

  if (quantity === 0) {
    return (
      <Button icon={CART_ICON} onClick={() => add(product)}>
        В корзину
      </Button>
    )
  }

  return (
    <div className="cart-control">
      <Counter
        value={quantity}
        onDecrease={() => decrease(product.id)}
        onIncrease={() => increase(product.id)}
      />
      <Button variant="pink" icon={CART_ICON} onClick={() => navigate('/cart')}>
        {full ? `В корзине ${quantity} шт.` : `${quantity} шт.`}
      </Button>
    </div>
  )
}

export default CartControl
