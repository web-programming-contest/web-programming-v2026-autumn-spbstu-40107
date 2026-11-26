import { setImageFallback } from '../components/ProductCard';
import { pluralizeGoods } from '../constants';
import { useApp } from '../context/AppContext';

export default function Cart() {
  const {
    cartTab,
    setCartTab,
    cartDetailed,
    selectedCartItems,
    allChecked,
    toggleAllCart,
    toggleCartItemCheck,
    changeQuantity,
    setDeleteConfirmModal,
    totalCartUnits,
    totalCartPrice,
    navigateTo,
    orders,
    orderPhone,
    setOrderPhone,
    orderEmail,
    setOrderEmail,
    deliveryType,
    setDeliveryType,
    orderAddress,
    setOrderAddress,
    paymentMethod,
    setPaymentMethod,
    needPackaging,
    setNeedPackaging,
    orderErrors,
    setOrderErrors,
    handleOrderSubmit
  } = useApp();

  return (
    <div className="container cart-page">
      <div className="tabs-bar">
        <button
          type="button"
          className={`tab-btn ${cartTab === 'cart' ? 'active' : ''}`}
          onClick={() => setCartTab('cart')}
        >
          Корзина
        </button>
        <button
          type="button"
          className={`tab-btn ${cartTab === 'history' ? 'active' : ''}`}
          onClick={() => setCartTab('history')}
        >
          История заказов
        </button>
      </div>

      {cartTab === 'cart' ? (
        cartDetailed.length === 0 ? (
          <div className="empty-cart-box">
            <div className="empty-cart-icon">🛒</div>
            <h2>Пока пусто</h2>
            <p>
              Ознакомьтесь с новинками и хитами на главной или найдите нужное в каталоге
            </p>
            <div className="empty-cart-actions">
              <button type="button" className="btn-blue" onClick={() => navigateTo('catalog')}>
                Перейти в каталог
              </button>
              <button type="button" className="btn-link" onClick={() => navigateTo('home')}>
                Главная страница
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="cart-list-card">
              <div className="cart-list-header">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={allChecked}
                    onChange={(event) => toggleAllCart(event.target.checked)}
                  />
                  <span>Выбрать все</span>
                </label>

                <button
                  type="button"
                  className="delete-link"
                  disabled={selectedCartItems.length === 0}
                  onClick={() => setDeleteConfirmModal({ mode: 'selected', product: null })}
                >
                  ✕ Удалить выбранные
                </button>
              </div>

              {cartDetailed.map((item) => (
                <div key={item.id} className="cart-row">
                  <input
                    type="checkbox"
                    checked={item.checked}
                    onChange={() => toggleCartItemCheck(item.id)}
                  />
                  <img
                    src={item.image}
                    alt={item.name}
                    className="cart-row-img"
                    onError={setImageFallback}
                  />
                  <div className="cart-row-title">{item.name}</div>
                  <div className="qty-controls">
                    <button type="button" onClick={() => changeQuantity(item.id, -1)}>
                      −
                    </button>
                    <span>{item.quantity}</span>
                    <button type="button" onClick={() => changeQuantity(item.id, 1)}>
                      +
                    </button>
                  </div>
                  <div className="cart-row-price">{item.price * item.quantity} ₽</div>
                  <button
                    type="button"
                    className="delete-link"
                    onClick={() =>
                      setDeleteConfirmModal({ mode: 'single', product: item })
                    }
                  >
                    ✕ Удалить
                  </button>
                </div>
              ))}

              <div className="cart-summary">
                <strong>
                  {totalCartUnits} {pluralizeGoods(totalCartUnits)} на {totalCartPrice} ₽
                </strong>
              </div>
            </div>

            <section className="order-section">
              <h2>Оформление заказа</h2>
              <form className="order-form-card" onSubmit={handleOrderSubmit} noValidate>
                <div className="order-row-two">
                  <div className="form-field">
                    <label>
                      Телефон <span className="req">*</span>
                    </label>
                    <input
                      type="tel"
                      placeholder="+7 (999) 000-00-00"
                      value={orderPhone}
                      onChange={(event) => {
                        setOrderPhone(event.target.value);
                        setOrderErrors((prev) => ({ ...prev, phone: false }));
                      }}
                      className={orderErrors.phone ? 'input-error' : ''}
                    />
                    {orderErrors.phone && (
                      <span className="error-text">Заполните обязательное поле</span>
                    )}
                  </div>

                  <div className="form-field">
                    <label>E-mail</label>
                    <input
                      type="email"
                      placeholder="example@mail.ru"
                      value={orderEmail}
                      onChange={(event) => setOrderEmail(event.target.value)}
                    />
                  </div>
                </div>

                <div className="radio-group">
                  <label className="radio-label">
                    <input
                      type="radio"
                      name="delivery"
                      checked={deliveryType === 'pickup'}
                      onChange={() => setDeliveryType('pickup')}
                    />
                    <span>Самовывоз</span>
                  </label>
                  <label className="radio-label">
                    <input
                      type="radio"
                      name="delivery"
                      checked={deliveryType === 'delivery'}
                      onChange={() => setDeliveryType('delivery')}
                    />
                    <span>Доставка</span>
                  </label>
                </div>

                {deliveryType === 'delivery' && (
                  <div className="form-field">
                    <label>
                      Адрес доставки <span className="req">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Город, улица, дом, квартира"
                      value={orderAddress}
                      onChange={(event) => {
                        setOrderAddress(event.target.value);
                        setOrderErrors((prev) => ({ ...prev, address: false }));
                      }}
                      className={orderErrors.address ? 'input-error' : ''}
                    />
                    {orderErrors.address && (
                      <span className="error-text">Заполните обязательное поле</span>
                    )}
                  </div>
                )}

                <div className="form-field payment-select-wrap">
                  <label>Способ оплаты</label>
                  <select
                    value={paymentMethod}
                    onChange={(event) => setPaymentMethod(event.target.value)}
                  >
                    <option value="По карте">По карте</option>
                    <option value="Наличными">Наличными</option>
                  </select>
                </div>

                <label className="checkbox-label packaging-check">
                  <input
                    type="checkbox"
                    checked={needPackaging}
                    onChange={(event) => setNeedPackaging(event.target.checked)}
                  />
                  <span>Нужна упаковка</span>
                </label>

                <button
                  type="submit"
                  className="btn-blue"
                  disabled={selectedCartItems.length === 0}
                >
                  Оформить заказ
                </button>
              </form>
            </section>
          </>
        )
      ) : (
        <div className="orders-history-list">
          {orders.length === 0 ? (
            <p>Заказов пока нет.</p>
          ) : (
            orders.map((order) => (
              <div key={order.id} className="order-history-row">
                <span className="order-num">
                  №{order.id} от {order.date}
                </span>
                <span className="order-cnt">
                  {order.totalCount} {pluralizeGoods(order.totalCount)}
                </span>
                <strong className="order-sum">{order.totalPrice} ₽</strong>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
