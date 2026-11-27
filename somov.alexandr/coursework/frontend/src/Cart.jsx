import {useState} from 'react';
import {Link} from 'react-router-dom';
import {formatPrice} from './catalog.js';
import {useCart} from './context/CartContext.jsx';
import Icon from './components/Icon.jsx';
import Modal from './components/Modal.jsx';
import CheckoutForm from './components/CheckoutForm.jsx';
import OrderHistory from './components/OrderHistory.jsx';

export default function Cart({goods, onOpen}) {
  const cart = useCart();
  const [tab, setTab] = useState('cart');
  const [selected, setSelected] = useState([]);
  const [confirm, setConfirm] = useState(null);
  const [success, setSuccess] = useState(null);
  const [sending, setSending] = useState(false);
  const products = cart.items.map((item) => {
    const product = goods.find((good) => good.id === item.productId);
    return product ? {...product, quantity: item.quantity} : null;
  }).filter(Boolean);
  const totalPrice = products.reduce((sum, product) => sum + product.price * product.quantity, 0);
  const selectedIds = selected.filter((id) => products.some((product) => product.id === id));
  const allSelected = products.length > 0 && selectedIds.length === products.length;

  function toggle(id) {
    setSelected((current) => current.includes(id) ? current.filter((value) => value !== id) : [...current, id]);
  }

  function removeConfirmed() {
    cart.removeSelected(confirm);
    setSelected((current) => current.filter((id) => !confirm.includes(id)));
    setConfirm(null);
  }

  function ordered(order) {
    cart.removeOrdered(order.items);
    setSelected([]);
    setSuccess(order);
  }

  return (
    <div className="cart-page">
      <div className="container cart-container">
        <h1 className="visually-hidden">Корзина и история заказов</h1>
        <div className="cart-tabs" aria-label="Разделы корзины">
          <button disabled={sending} className={tab === 'cart' ? 'active' : ''} aria-pressed={tab === 'cart'} onClick={() => setTab('cart')}>Корзина</button>
          <button disabled={sending} className={tab === 'history' ? 'active' : ''} aria-pressed={tab === 'history'} onClick={() => setTab('history')}>История заказов</button>
        </div>
        {tab === 'history' ? <OrderHistory /> : !products.length ? (
          <section className="empty-cart">
            <img src="/assets/images/empty-cart.png" alt="" />
            <h2>Пока пусто</h2>
            <p>Ознакомьтесь с новинками и хитами на главной<br />или найдите нужное в каталоге.</p>
            <div className="empty-cart-actions"><Link className="button" to="/catalog">Перейти в каталог</Link><Link className="text-button" to="/">Главная страница</Link></div>
          </section>
        ) : (
          <>
            <fieldset className="cart-panel" disabled={sending} aria-label="Товары в корзине">
              <div className="cart-toolbar">
                <label className="checkbox-label"><input type="checkbox" checked={allSelected} onChange={() => setSelected(allSelected ? [] : products.map((product) => product.id))} />Выбрать все товары</label>
                <button className="text-button" disabled={!selectedIds.length} onClick={() => setConfirm(selectedIds)}>Удалить отмеченные</button>
              </div>
              <ul className="cart-items">{products.map((product) => (
                <li className="cart-item" key={product.id}>
                  <input className="item-checkbox" type="checkbox" aria-label={`Выбрать: ${product.name}`} checked={selectedIds.includes(product.id)} onChange={() => toggle(product.id)} />
                  <button className="cart-item-image" onClick={() => onOpen(product)} aria-label={`Подробнее: ${product.name}`}><img src={product.image} alt={product.name} /></button>
                  <span className="cart-item-name">{product.name}</span>
                  <div className="quantity-control"><button aria-label={`Уменьшить количество: ${product.name}`} onClick={() => product.quantity === 1 ? setConfirm([product.id]) : cart.setQuantity(product.id, product.quantity - 1)}>−</button><output aria-live="polite">{product.quantity}</output><button aria-label={`Увеличить количество: ${product.name}`} onClick={() => cart.addItem(product.id)}>+</button></div>
                  <strong className="cart-item-price">{formatPrice(product.price * product.quantity)}</strong>
                  <button className="text-button delete-item" onClick={() => setConfirm([product.id])} aria-label={`Удалить: ${product.name}`}><Icon name="close" />Удалить</button>
                </li>
              ))}</ul>
              <p className="cart-total" aria-live="polite">Товаров: {cart.totalQuantity} на {formatPrice(totalPrice)}</p>
            </fieldset>
            <CheckoutForm items={cart.items} onSuccess={ordered} sending={sending} setSending={setSending} />
          </>
        )}
      </div>
      {confirm && <Modal title="Вы уверены, что хотите удалить?" onClose={() => setConfirm(null)}><p>{confirm.length === 1 ? goods.find((product) => product.id === confirm[0])?.name : `Будут удалены отмеченные товары: ${confirm.length}.`}</p><div className="modal-actions"><button className="text-button" onClick={() => setConfirm(null)}>Отмена</button><button className="button" onClick={removeConfirmed}>Да, удалить</button></div></Modal>}
      {success && <Modal title="Спасибо, ваш заказ успешно оформлен" onClose={() => setSuccess(null)}><img className="success-illustration" src="/assets/images/order-success.png" alt="" /><p>Номер заказа: {success.id}.</p><p>Мы свяжемся с вами, чтобы уточнить удобное время получения.</p><div className="modal-actions"><button className="button" onClick={() => { setSuccess(null); setTab('history'); }}>Посмотреть заказ</button></div></Modal>}
    </div>
  );
}
