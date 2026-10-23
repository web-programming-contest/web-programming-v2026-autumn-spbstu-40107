import { Link, useNavigate } from 'react-router'
import Button from './Button.jsx'

function EmptyCart() {
  const navigate = useNavigate()

  return (
    <div className="empty-cart">
      <img src="/images/illustrations/empty-cart.png" alt="" width="148" height="134" />
      <h2 className="title">Пока пусто</h2>
      <p className="empty-cart__text">
        Ознакомьтесь с новинками и хитами на главной или найдите нужное в каталоге
      </p>
      <div className="empty-cart__actions">
        <Button onClick={() => navigate('/catalog')}>Перейти в каталог</Button>
        <Link to="/" className="empty-cart__link">
          Главная страница
        </Link>
      </div>
    </div>
  )
}

export default EmptyCart
