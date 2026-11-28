import {useEffect, useRef, useState} from 'react';
import {Link} from 'react-router-dom';
import {useApp} from '../ctx.js';
import {api} from '../api.js';
import {Field, Icon, Modal, Photo, Qty, fmt} from '../ui.jsx';
const INITIAL = {
  email: '',
  phone: '',
  delivery: 'pickup',
  address: '',
  payment: '',
  packaging: false,
};
export default function Cart() {
  const {goods, cart, remove, clear} = useApp();
  const [tab, setTab] = useState('cart');
  const [selected, setSelected] = useState([]);
  const [ask, setAsk] = useState(null);
  const [form, setForm] = useState(INITIAL);
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const [serverError, setServerError] = useState('');
  const [success, setSuccess] = useState(null);
  const [orders, setOrders] = useState([]);
  const [historyState, setHistoryState] = useState('loading');
  const [historyError, setHistoryError] = useState('');
  const requestKey = useRef(null);
  const sending = useRef(false);
  const items = cart
    .map((item) => ({...item, g: goods.find((g) => g.id === item.id)}))
    .filter((item) => item.g)
    .sort((a, b) => a.id - b.id);
  const ids = items.map((i) => i.id);
  const selection = selected.filter((id) => ids.includes(id));
  const stale = cart.filter((i) => !ids.includes(i.id)).map((i) => i.id);
  const count = items.reduce((sum, i) => sum + i.quantity, 0);
  const total = items.reduce((sum, i) => sum + i.quantity * i.g.price, 0);
  const loadOrders = async () => {
    setHistoryState('loading');
    try {
      setOrders(await api.orders());
      setHistoryState('ready');
    } catch (e) {
      setHistoryError(e.message);
      setHistoryState('error');
    }
  };
  useEffect(() => {
    if (tab === 'history') {
      loadOrders();
    }
  }, [tab]);
  const set = (key, value) => {
    setForm({...form, [key]: value});
    setErrors({...errors, [key]: ''});
    setServerError('');
  };
  const submit = async (event) => {
    event.preventDefault();
    if (sending.current || !items.length) {
      return;
    }
    const next = {};
    if (
      !/^[+\d\s()-]+$/.test(form.phone.trim()) ||
      !/^\d{10,15}$/.test(form.phone.replace(/\D/g, ''))
    ) {
      next.phone = 'Введите корректный номер телефона';
    }
    if (
      form.email.trim() &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())
    ) {
      next.email = 'Введите корректный e-mail';
    }
    if (form.delivery === 'delivery' && form.address.trim().length < 5) {
      next.address = 'Укажите адрес доставки (не менее 5 символов)';
    }
    if (!form.payment) {
      next.payment = 'Выберите способ оплаты';
    }
    setErrors(next);
    setServerError('');
    if (Object.keys(next).length) {
      return;
    }
    const payload = {
      ...form,
      items: items.map(({id, quantity}) => ({id, quantity})),
    };
    const fingerprint = JSON.stringify(payload);
    if (requestKey.current?.fingerprint !== fingerprint) {
      requestKey.current = {fingerprint, id: crypto.randomUUID()};
    }
    sending.current = true;
    setBusy(true);
    try {
      const order = await api.order({
        ...payload,
        clientRequestId: requestKey.current.id,
      });
      clear();
      setSelected([]);
      setForm(INITIAL);
      setSuccess(order);
      requestKey.current = null;
    } catch (e) {
      setServerError(e.message);
      if (e.errors) {
        setErrors(e.errors);
      }
    } finally {
      sending.current = false;
      setBusy(false);
    }
  };
  return (
    <>
      <h1 className="sr-only">Корзина и история заказов</h1>
      <div className="tabs" role="tablist" aria-label="Заказы">
        <button
          id="cart-tab"
          role="tab"
          aria-controls="cart-panel"
          aria-selected={tab === 'cart'}
          className={tab === 'cart' ? 'active' : ''}
          onClick={() => setTab('cart')}
        >
          Корзина
        </button>
        <button
          id="history-tab"
          role="tab"
          aria-controls="history-panel"
          aria-selected={tab === 'history'}
          className={tab === 'history' ? 'active' : ''}
          onClick={() => setTab('history')}
        >
          История заказов
        </button>
      </div>
      {tab === 'history' ? (
        <section
          id="history-panel"
          role="tabpanel"
          aria-labelledby="history-tab"
        >
          {historyState === 'loading' ? (
            <p className="empty" role="status">
              Загружаем заказы…
            </p>
          ) : historyState === 'error' ? (
            <div className="empty" role="alert">
              <p>{historyError}</p>
              <button className="btn" onClick={loadOrders}>
                Повторить
              </button>
            </div>
          ) : !orders.length ? (
            <div className="empty">
              <h2>Заказов пока нет</h2>
              <p>Первый заказ будет ждать вас здесь.</p>
              <Link to="/catalog" className="btn">
                Перейти в каталог
              </Link>
            </div>
          ) : (
            <ul className="order-history" aria-label="Список заказов">
              {orders.map((order) => (
                <li key={order.id} className="order-record">
                  <div className="order-summary">
                    <div>
                      <h2>
                        № {order.number} от{' '}
                        <time dateTime={order.date}>
                          {new Date(order.date).toLocaleDateString('ru-RU')}
                        </time>
                      </h2>
                      <p className="muted">Товаров: {order.count}</p>
                    </div>
                    <strong>{fmt(order.total)}</strong>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      ) : (
        <section id="cart-panel" role="tabpanel" aria-labelledby="cart-tab">
          {stale.length > 0 && (
            <div className="notice">
              Некоторых товаров больше нет в каталоге.{' '}
              <button className="text-button" onClick={() => remove(stale)}>
                Убрать недоступные товары
              </button>
            </div>
          )}
          {!items.length ? (
            <div className="empty empty-cart">
              <div className="empty-cart-icon">
                <Icon name="cart" width="64" height="64" />
                <span>0</span>
              </div>
              <h2>Пока пусто</h2>
              <p>
                Ознакомьтесь с новинками и хитами на главной
                <br className="desktop-only" /> или найдите нужное в каталоге.
              </p>
              <Link className="btn" to="/catalog">
                Перейти в каталог
              </Link>
              <Link to="/" className="text-button">
                Главная страница
              </Link>
            </div>
          ) : (
            <>
              <div className="cart-toolbar">
                <label className="check-label">
                  <input
                    type="checkbox"
                    disabled={busy}
                    checked={selection.length === ids.length}
                    onChange={() =>
                      setSelected(selection.length === ids.length ? [] : ids)
                    }
                  />
                  Выбрать все
                </label>
                <button
                  className="text-button"
                  disabled={!selection.length || busy}
                  onClick={() => setAsk(selection)}
                >
                  Удалить выбранные
                  {selection.length > 0 ? ` (${selection.length})` : ''}
                </button>
                <button
                  className="text-button clear-cart"
                  disabled={busy}
                  onClick={() => setAsk(ids)}
                >
                  Очистить корзину
                </button>
              </div>
              <div className="cart-items">
                {items.map(({g, quantity}) => (
                  <article className="cart-row" key={g.id}>
                    <input
                      type="checkbox"
                      disabled={busy}
                      aria-label={`Выбрать: ${g.name}`}
                      checked={selection.includes(g.id)}
                      onChange={() =>
                        setSelected(
                          selection.includes(g.id)
                            ? selection.filter((id) => id !== g.id)
                            : [...selection, g.id],
                        )
                      }
                    />
                    <Photo g={g} />
                    <div className="cart-name">
                      <h2>{g.name}</h2>
                      <button
                        className="text-button remove-item"
                        disabled={busy}
                        onClick={() => setAsk([g.id])}
                      >
                        <Icon name="trash" width="18" height="18" />
                        Удалить
                      </button>
                    </div>
                    <Qty id={g.id} q={quantity} min={1} disabled={busy} />
                    <strong className="cart-price">
                      {fmt(g.price * quantity)}
                    </strong>
                  </article>
                ))}
              </div>
              <div className="cart-total">
                Товаров: {count}{' '}
                <span>
                  Итого <strong>{fmt(total)}</strong>
                </span>
              </div>
              <form className="order-form" onSubmit={submit} noValidate>
                <h2>Оформление заказа</h2>
                <fieldset disabled={busy}>
                  <div className="form-columns">
                    <Field
                      label="Телефон"
                      type="tel"
                      autoComplete="tel"
                      placeholder="+7 (___) ___-__-__"
                      required
                      maxLength={30}
                      value={form.phone}
                      error={errors.phone}
                      onChange={(e) => set('phone', e.target.value)}
                    />
                    <Field
                      label="E-mail"
                      type="email"
                      autoComplete="email"
                      placeholder="mail@example.ru"
                      maxLength={254}
                      value={form.email}
                      error={errors.email}
                      onChange={(e) => set('email', e.target.value)}
                    />
                  </div>
                  <fieldset className="delivery-options">
                    <legend>Способ получения</legend>
                    <label className="check-label">
                      <input
                        type="radio"
                        name="delivery"
                        value="pickup"
                        checked={form.delivery === 'pickup'}
                        onChange={() => set('delivery', 'pickup')}
                      />
                      Самовывоз
                    </label>
                    <label className="check-label">
                      <input
                        type="radio"
                        name="delivery"
                        value="delivery"
                        checked={form.delivery === 'delivery'}
                        onChange={() => set('delivery', 'delivery')}
                      />
                      Доставка
                    </label>
                  </fieldset>
                  {form.delivery === 'delivery' ? (
                    <Field
                      label="Адрес доставки"
                      required
                      autoComplete="street-address"
                      maxLength={500}
                      placeholder="Город, улица, дом, квартира"
                      value={form.address}
                      error={errors.address}
                      onChange={(e) => set('address', e.target.value)}
                    />
                  ) : (
                    <p className="pickup-address">
                      Санкт-Петербург, ул. Барочная, д. 7, корпус 2
                    </p>
                  )}
                  <label className="field payment-field">
                    <span>
                      Способ оплаты<span className="required"> *</span>
                    </span>
                    <select
                      className={errors.payment ? 'invalid' : ''}
                      value={form.payment}
                      onChange={(e) => set('payment', e.target.value)}
                      aria-invalid={Boolean(errors.payment)}
                    >
                      <option value="">Не выбрано</option>
                      <option value="card">По карте</option>
                      <option value="cash">Наличными</option>
                    </select>
                    {errors.payment && (
                      <span className="error-text">{errors.payment}</span>
                    )}
                  </label>
                  <label className="check-label packaging">
                    <input
                      type="checkbox"
                      checked={form.packaging}
                      onChange={(e) => set('packaging', e.target.checked)}
                    />
                    Нужна упаковка
                  </label>
                  {serverError && (
                    <p className="error-text" role="alert">
                      {serverError}
                    </p>
                  )}
                  <button className="btn" type="submit" disabled={busy}>
                    {busy ? 'Отправляем заказ…' : 'Оформить заказ'}
                  </button>
                </fieldset>
              </form>
            </>
          )}
        </section>
      )}
      {ask && (
        <Modal
          title="Вы уверены, что хотите удалить?"
          onClose={() => setAsk(null)}
        >
          <p>
            {ask.length === 1
              ? `Вы действительно хотите удалить «${goods.find((g) => g.id === ask[0])?.name}» из корзины?`
              : `Вы действительно хотите удалить выбранные товары (${ask.length}) из корзины?`}
          </p>
          <div className="modal-actions">
            <button
              className="btn"
              onClick={() => {
                remove(ask);
                setSelected(selected.filter((id) => !ask.includes(id)));
                setAsk(null);
              }}
            >
              Да, удалить
            </button>
            <button className="text-button" onClick={() => setAsk(null)}>
              Отмена
            </button>
          </div>
        </Modal>
      )}
      {success && (
        <Modal
          title="Спасибо, ваш заказ успешно оформлен"
          onClose={() => setSuccess(null)}
        >
          <div className="success-icon">
            <Icon name="check" width="42" height="42" />
          </div>
          <p>
            Номер заказа {success.number}. Мы свяжемся с вами в течение 10
            минут, чтобы уточнить{' '}
            {success.delivery === 'delivery'
              ? 'удобное время доставки'
              : 'детали самовывоза'}
            .
          </p>
          <div className="modal-actions">
            <button
              className="btn"
              onClick={() => {
                setSuccess(null);
                setTab('history');
              }}
            >
              Посмотреть заказ
            </button>
            <button className="text-button" onClick={() => setSuccess(null)}>
              Ок
            </button>
          </div>
        </Modal>
      )}
    </>
  );
}
