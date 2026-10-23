import { useState } from 'react'
import { useCart } from '../context/CartContext.jsx'
import { formatCount, formatPrice } from '../utils/format.js'
import Button from './Button.jsx'
import Checkbox from './Checkbox.jsx'
import Counter from './Counter.jsx'
import CheckoutForm from './CheckoutForm.jsx'
import EmptyCart from './EmptyCart.jsx'
import Modal from './Modal.jsx'
import './CartTab.css'

function CartTab() {
  const { items, count, total, increase, decrease, remove } = useCart()
  const [selected, setSelected] = useState([])
  const [toDelete, setToDelete] = useState(null)
  const [orderId, setOrderId] = useState(null)

  const allSelected = items.length > 0 && items.every((item) => selected.includes(item.id))

  const toggleAll = () => {
    setSelected(allSelected ? [] : items.map((item) => item.id))
  }

  const toggleOne = (id) => {
    setSelected(selected.includes(id) ? selected.filter((item) => item !== id) : [...selected, id])
  }

  const handleDecrease = (item) => {
    if (item.quantity === 1) {
      setToDelete([item.id])
    } else {
      decrease(item.id)
    }
  }

  const confirmDelete = () => {
    remove(toDelete)
    setSelected(selected.filter((id) => !toDelete.includes(id)))
    setToDelete(null)
  }

  return (
    <>
      {items.length === 0 ? (
        <EmptyCart />
      ) : (
        <>
          <section className="panel cart-list">
            <div className="cart-list__toolbar">
              <Checkbox label="Выбрать все" checked={allSelected} onChange={toggleAll} />
              <button
                type="button"
                className="cart-list__delete"
                disabled={selected.length === 0}
                onClick={() => setToDelete(selected)}
              >
                Удалить выбранные
              </button>
            </div>

            <ul className="cart-list__items">
              {items.map((item) => (
                <li key={item.id} className="cart-item">
                  <Checkbox
                    checked={selected.includes(item.id)}
                    onChange={() => toggleOne(item.id)}
                    aria-label={`Выбрать ${item.name}`}
                  />
                  <div className="cart-item__image">
                    <img src={item.image} alt={item.name} />
                  </div>
                  <p className="cart-item__name">{item.name}</p>
                  <Counter
                    value={item.quantity}
                    onDecrease={() => handleDecrease(item)}
                    onIncrease={() => increase(item.id)}
                  />
                  <p className="cart-item__price">{formatPrice(item.price * item.quantity)}</p>
                  <button
                    type="button"
                    className="cart-list__delete"
                    onClick={() => setToDelete([item.id])}
                  >
                    Удалить
                  </button>
                </li>
              ))}
            </ul>

            <p className="cart-list__total subtitle">
              {formatCount(count)} на {formatPrice(total)}
            </p>
          </section>

          <CheckoutForm onSuccess={setOrderId} />
        </>
      )}

      {toDelete && (
        <Modal onClose={() => setToDelete(null)}>
          <h2 className="title cart-modal__title">Вы уверены, что хотите удалить?</h2>
          <p className="cart-modal__text">
            {toDelete.length === 1
              ? items.find((item) => item.id === toDelete[0])?.name
              : `Выбрано: ${formatCount(toDelete.length)}`}
          </p>
          <div className="cart-modal__actions">
            <Button variant="text" onClick={() => setToDelete(null)}>
              Отмена
            </Button>
            <Button onClick={confirmDelete}>Да, удалить</Button>
          </div>
        </Modal>
      )}

      {orderId && (
        <Modal onClose={() => setOrderId(null)}>
          <img src="/images/illustrations/success.png" alt="" width="76" height="51" />
          <h2 className="cart-modal__success-title">Спасибо, ваш заказ успешно оформлен!</h2>
          <p className="cart-modal__success-text">
            Номер заказа {orderId}. Мы свяжемся с вами в течение 10 минут, чтобы уточнить удобное
            для вас время
          </p>
          <div className="cart-modal__actions">
            <Button onClick={() => setOrderId(null)}>Ок</Button>
          </div>
        </Modal>
      )}
    </>
  )
}

export default CartTab
