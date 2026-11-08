import React, {useState, useEffect} from 'react';
import {Link} from 'react-router-dom';
import {API_URL} from '../App';
import {resolveProductImage} from '../components/ProductCard';

function pluralizeGoods(count) {
  const mod10 = count % 10;
  const mod100 = count % 100;
  if (mod10 === 1 && mod100 !== 11) {
    return `${count} товар`;
  }
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) {
    return `${count} товара`;
  }
  return `${count} товаров`;
}

function Cart({cart, onUpdateQuantity, onRemoveFromCart, onClearCart}) {
  const [activeTab, setActiveTab] = useState('cart');
  const [selectedIds, setSelectedIds] = useState([]);
  const [orders, setOrders] = useState([]);

  const [deleteDialog, setDeleteDialog] = useState(null);

  const [orderSuccessModal, setOrderSuccessModal] = useState(null);

  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [deliveryType, setDeliveryType] = useState('delivery');
  const [address, setAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [needPackaging, setNeedPackaging] = useState(true);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    setSelectedIds((prev) =>
      prev.filter((id) => cart.some((item) => item.id === id)),
    );
  }, [cart]);

  const fetchOrders = () => {
    fetch(`${API_URL}/orders`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setOrders(data);
        }
      })
      .catch((err) => console.error('Ошибка загрузки истории заказов:', err));
  };

  useEffect(() => {
    fetchOrders();
  }, [activeTab]);

  const allSelected = cart.length > 0 && selectedIds.length === cart.length;

  const handleToggleAll = () => {
    if (allSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(cart.map((item) => item.id));
    }
  };

  const handleToggleOne = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const openSingleDeleteModal = (item) => {
    setDeleteDialog({
      ids: [item.id],
      title: item.name || item.title,
    });
  };

  const openBulkDeleteModal = () => {
    if (selectedIds.length === 0) {
      return;
    }
    if (selectedIds.length === 1) {
      const item = cart.find((c) => c.id === selectedIds[0]);
      setDeleteDialog({
        ids: selectedIds,
        title: item ? item.name || item.title : 'выбранный товар',
      });
    } else {
      setDeleteDialog({
        ids: selectedIds,
        title: `выбранные товары (${selectedIds.length} шт.)`,
      });
    }
  };

  const confirmDelete = () => {
    if (deleteDialog) {
      onRemoveFromCart(deleteDialog.ids);
      setDeleteDialog(null);
    }
  };

  const totalItemsCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalOrderPrice = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  const handleOrderSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!phone.trim()) {
      newErrors.phone = 'Заполните обязательное поле';
    }
    if (deliveryType === 'delivery' && !address.trim()) {
      newErrors.address = 'Заполните обязательное поле';
    }
    if (!paymentMethod) {
      newErrors.paymentMethod = 'Выберите способ оплаты';
    }

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/orders`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          items: cart,
          phone,
          email,
          deliveryType,
          address: deliveryType === 'delivery' ? address : '',
          paymentMethod,
          needPackaging,
          totalCount: totalItemsCount,
          totalPrice: totalOrderPrice,
        }),
      });

      const createdOrder = await response.json();
      setOrderSuccessModal({
        orderNumber:
          createdOrder.orderNumber ||
          createdOrder.id ||
          Math.floor(10000 + Math.random() * 90000),
      });
    } catch (error) {
      console.error('Ошибка отправки заказа:', error);
    }
  };

  const handleCloseSuccessModal = () => {
    setOrderSuccessModal(null);
    onClearCart();
    setPhone('');
    setEmail('');
    setAddress('');
    setPaymentMethod('');
    fetchOrders();
  };

  return (
    <div className="cart-page container">
      <div className="tabs-bar">
        <button
          type="button"
          className={`tab-btn ${activeTab === 'cart' ? 'active' : ''}`}
          onClick={() => setActiveTab('cart')}
        >
          Корзина
        </button>
        <button
          type="button"
          className={`tab-btn ${activeTab === 'history' ? 'active' : ''}`}
          onClick={() => setActiveTab('history')}
        >
          История заказов
        </button>
      </div>

      {activeTab === 'cart' ? (
        cart.length === 0 && !orderSuccessModal ? (
          <div className="empty-cart-box">
            <div className="empty-cart-illustration">🛒</div>
            <h2 className="empty-cart-title">Пока пусто</h2>
            <p className="empty-cart-text">
              Ознакомьтесь с новинками и хитами на главной
              <br />
              или найдите нужное в каталоге
            </p>
            <div className="empty-cart-actions">
              <Link to="/catalog" className="btn btn--blue">
                Перейти в каталог
              </Link>
              <Link to="/" className="empty-cart-home-link">
                Главная страница
              </Link>
            </div>
          </div>
        ) : (
          <>
            <div className="cart-panel">
              <div className="cart-header-controls">
                <label className="custom-checkbox">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={handleToggleAll}
                  />
                  <span className="checkmark" />
                  <span className="checkbox-label">Выбрать все</span>
                </label>

                {selectedIds.length > 0 && (
                  <button
                    type="button"
                    className="delete-link"
                    onClick={openBulkDeleteModal}
                  >
                    ✕ Удалить все
                  </button>
                )}
              </div>

              <div className="cart-items-list">
                {cart.map((item) => (
                  <div className="cart-item-row" key={item.id}>
                    <label className="custom-checkbox">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(item.id)}
                        onChange={() => handleToggleOne(item.id)}
                      />
                      <span className="checkmark" />
                    </label>

                    <div className="cart-item-img-box">
                      <img
                        src={resolveProductImage(item)}
                        alt={item.name || item.title}
                      />
                    </div>

                    <div className="cart-item-title">
                      {item.name || item.title}
                    </div>

                    <div className="qty-controls">
                      <button
                        type="button"
                        className="qty-btn"
                        onClick={() => {
                          if (item.quantity === 1) {
                            openSingleDeleteModal(item);
                          } else {
                            onUpdateQuantity(item.id, -1);
                          }
                        }}
                      >
                        −
                      </button>
                      <span className="qty-value">{item.quantity}</span>
                      <button
                        type="button"
                        className="qty-btn"
                        onClick={() => onUpdateQuantity(item.id, 1)}
                      >
                        +
                      </button>
                    </div>

                    <div className="cart-item-price">
                      {(item.price * item.quantity).toLocaleString('ru-RU')} ₽
                    </div>

                    <button
                      type="button"
                      className="delete-link"
                      onClick={() => openSingleDeleteModal(item)}
                    >
                      ✕ Удалить
                    </button>
                  </div>
                ))}
              </div>

              <div className="cart-summary-row">
                <span>
                  {pluralizeGoods(totalItemsCount)} на{' '}
                  {totalOrderPrice.toLocaleString('ru-RU')} ₽
                </span>
              </div>
            </div>

            <section className="checkout-section">
              <h2 className="section-heading">Оформление заказа</h2>
              <form
                className="checkout-panel"
                onSubmit={handleOrderSubmit}
                noValidate
              >
                <div className="checkout-row-two">
                  <div className="form-field">
                    <label className="field-label">
                      Телефон <span className="req-star">*</span>
                    </label>
                    <input
                      type="text"
                      className={`text-input ${errors.phone ? 'input-error' : ''}`}
                      placeholder="+7 (___) ___-__-__"
                      value={phone}
                      onChange={(e) => {
                        setPhone(e.target.value);
                        if (errors.phone) {
                          setErrors({...errors, phone: null});
                        }
                      }}
                    />
                    {errors.phone && (
                      <span className="error-text">{errors.phone}</span>
                    )}
                  </div>

                  <div className="form-field">
                    <label className="field-label">E-mail</label>
                    <input
                      type="email"
                      className="text-input"
                      placeholder="example@mail.ru"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>

                <div className="radio-group">
                  <label className="custom-radio">
                    <input
                      type="radio"
                      name="deliveryType"
                      checked={deliveryType === 'pickup'}
                      onChange={() => setDeliveryType('pickup')}
                    />
                    <span className="radiomark" />
                    <span>Самовывоз</span>
                  </label>

                  <label className="custom-radio">
                    <input
                      type="radio"
                      name="deliveryType"
                      checked={deliveryType === 'delivery'}
                      onChange={() => setDeliveryType('delivery')}
                    />
                    <span className="radiomark" />
                    <span>Доставка</span>
                  </label>
                </div>

                {deliveryType === 'delivery' && (
                  <div className="form-field form-field--wide">
                    <label className="field-label">
                      Адрес доставки <span className="req-star">*</span>
                    </label>
                    <input
                      type="text"
                      className={`text-input ${errors.address ? 'input-error' : ''}`}
                      placeholder="Город, улица, дом, квартира"
                      value={address}
                      onChange={(e) => {
                        setAddress(e.target.value);
                        if (errors.address) {
                          setErrors({...errors, address: null});
                        }
                      }}
                    />
                    {errors.address && (
                      <span className="error-text">{errors.address}</span>
                    )}
                  </div>
                )}

                <div className="form-field form-field--select">
                  <label className="field-label">Способ оплаты</label>
                  <select
                    className={`select-input ${errors.paymentMethod ? 'input-error' : ''}`}
                    value={paymentMethod}
                    onChange={(e) => {
                      setPaymentMethod(e.target.value);
                      if (errors.paymentMethod) {
                        setErrors({...errors, paymentMethod: null});
                      }
                    }}
                  >
                    <option value="">Не выбрано</option>
                    <option value="card">По карте</option>
                    <option value="cash">Наличными</option>
                  </select>
                  {errors.paymentMethod && (
                    <span className="error-text">{errors.paymentMethod}</span>
                  )}
                </div>

                <div className="packaging-check">
                  <label className="custom-checkbox">
                    <input
                      type="checkbox"
                      checked={needPackaging}
                      onChange={(e) => setNeedPackaging(e.target.checked)}
                    />
                    <span className="checkmark" />
                    <span className="checkbox-label">Нужна упаковка</span>
                  </label>
                </div>

                <button
                  type="submit"
                  className="btn btn--blue checkout-submit-btn"
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
            <div className="empty-catalog-message">
              История заказов пока пуста
            </div>
          ) : (
            orders.map((order, idx) => (
              <div className="order-history-card" key={order.id || idx}>
                <span className="order-number-date">
                  №{order.orderNumber || order.id} от{' '}
                  {order.date || '28.04.2024'}
                </span>
                <span className="order-count">
                  {pluralizeGoods(order.totalCount || 1)}
                </span>
                <span className="order-total">
                  {Number(order.totalPrice || 0).toLocaleString('ru-RU')} ₽
                </span>
              </div>
            ))
          )}
        </div>
      )}

      {deleteDialog && (
        <div className="modal-overlay" onClick={() => setDeleteDialog(null)}>
          <div
            className="modal-window dialog-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="modal-close"
              onClick={() => setDeleteDialog(null)}
            >
              ✕
            </button>
            <h3 className="dialog-title">
              Вы действительно хотите удалить {deleteDialog.title}?
            </h3>
            <div className="dialog-actions">
              <button
                type="button"
                className="btn-cancel-pink"
                onClick={() => setDeleteDialog(null)}
              >
                Отмена
              </button>
              <button
                type="button"
                className="btn btn--blue"
                onClick={confirmDelete}
              >
                Да, удалить
              </button>
            </div>
          </div>
        </div>
      )}

      {orderSuccessModal && (
        <div className="modal-overlay" onClick={handleCloseSuccessModal}>
          <div
            className="modal-window dialog-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="modal-close"
              onClick={handleCloseSuccessModal}
            >
              ✕
            </button>
            <div className="success-icon-badge">🎉</div>
            <h3 className="dialog-title">Спасибо за заказ!</h3>
            <p className="dialog-subtitle">
              Номер заказа {orderSuccessModal.orderNumber}.
            </p>
            <p className="dialog-text">
              Мы свяжемся с вами в течение 10 минут, чтобы уточнить удобное для
              вас время доставки
            </p>
            <div className="dialog-actions">
              <button
                type="button"
                className="btn btn--blue"
                onClick={handleCloseSuccessModal}
              >
                Ок
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Cart;
