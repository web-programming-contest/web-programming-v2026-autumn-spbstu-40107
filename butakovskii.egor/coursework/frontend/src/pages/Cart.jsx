import {useState, useEffect, useMemo} from 'react';
import {Link} from 'react-router-dom';

export default function Cart() {
  const [activeTab, setActiveTab] = useState('cart');
  const [cart, setCart] = useState(() =>
    JSON.parse(localStorage.getItem('cart') || '{}'),
  );
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);

  const [selectedItems, setSelectedItems] = useState([]);
  const [form, setForm] = useState({
    phone: '',
    email: '',
    delivery: 'pickup',
    address: '',
    payment: '',
    packaging: false,
  });

  const [deleteModal, setDeleteModal] = useState(null);
  const [successModal, setSuccessModal] = useState(false);

  useEffect(() => {
    fetch('/api/goods')
      .then((r) => r.json())
      .then(setProducts);
    fetch('/api/orders')
      .then((r) => r.json())
      .then(setOrders);
  }, []);

  const cartItems = useMemo(() => {
    return Object.entries(cart)
      .map(([id, count]) => {
        const p = products.find((prod) => prod.id === Number(id));
        return p ? {...p, count} : null;
      })
      .filter(Boolean);
  }, [cart, products]);

  useEffect(() => {
    if (cartItems.length > 0 && selectedItems.length === 0) {
      setSelectedItems(cartItems.map((i) => i.id));
    }
  }, [cartItems]);

  const totalCost = cartItems
    .filter((i) => selectedItems.includes(i.id))
    .reduce((sum, i) => sum + i.price * i.count, 0);

  const totalCount = cartItems
    .filter((i) => selectedItems.includes(i.id))
    .reduce((sum, i) => sum + i.count, 0);

  const updateCartCount = (id, delta) => {
    const newCart = {...cart};
    newCart[id] += delta;
    if (newCart[id] <= 0) {
      setDeleteModal(id);
      return;
    }
    setCart(newCart);
    localStorage.setItem('cart', JSON.stringify(newCart));
    window.dispatchEvent(new Event('storage'));
  };

  const confirmDelete = () => {
    const newCart = {...cart};
    if (deleteModal === 'all') {
      selectedItems.forEach((id) => delete newCart[id]);
      setSelectedItems([]);
    } else {
      delete newCart[deleteModal];
      setSelectedItems((prev) => prev.filter((id) => id !== deleteModal));
    }
    setCart(newCart);
    localStorage.setItem('cart', JSON.stringify(newCart));
    window.dispatchEvent(new Event('storage'));
    setDeleteModal(null);
  };

  const submitOrder = async (e) => {
    e.preventDefault();
    if (selectedItems.length === 0) return;

    await fetch('/api/orders', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        items: cartItems
          .filter((i) => selectedItems.includes(i.id))
          .map((i) => ({id: i.id, count: i.count})),
        total: totalCost,
        details: form,
      }),
    });

    localStorage.removeItem('cart');
    setCart({});
    setSelectedItems([]);
    window.dispatchEvent(new Event('storage'));

    const updatedOrders = await fetch('/api/orders').then((r) => r.json());
    setOrders(updatedOrders);

    setSuccessModal(true);
  };

  return (
    <div className="container" style={{marginTop: '30px', flex: 1}}>
      <div
        style={{
          display: 'flex',
          gap: '30px',
          borderBottom: '1px solid #eee',
          marginBottom: '30px',
          paddingBottom: '10px',
        }}
      >
        <button
          onClick={() => setActiveTab('cart')}
          style={{
            background: 'none',
            border: 'none',
            fontSize: '16px',
            fontWeight: activeTab === 'cart' ? 'bold' : 'normal',
            color: activeTab === 'cart' ? 'var(--primary-blue)' : '#333',
            borderBottom:
              activeTab === 'cart' ? '2px solid var(--primary-blue)' : 'none',
            cursor: 'pointer',
            paddingBottom: '12px',
            marginBottom: '-11px',
          }}
        >
          Корзина
        </button>
        <button
          onClick={() => setActiveTab('history')}
          style={{
            background: 'none',
            border: 'none',
            fontSize: '16px',
            fontWeight: activeTab === 'history' ? 'bold' : 'normal',
            color: activeTab === 'history' ? 'var(--primary-blue)' : '#333',
            borderBottom:
              activeTab === 'history'
                ? '2px solid var(--primary-blue)'
                : 'none',
            cursor: 'pointer',
            paddingBottom: '12px',
            marginBottom: '-11px',
          }}
        >
          История заказов
        </button>
      </div>

      {activeTab === 'history' ? (
        <div
          style={{
            background: '#fff',
            borderRadius: '12px',
            padding: '30px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
          }}
        >
          {orders.length === 0 ? (
            <p>Вы еще ничего не заказывали.</p>
          ) : (
            <div
              style={{display: 'flex', flexDirection: 'column', gap: '15px'}}
            >
              {orders.map((o) => (
                <div
                  key={o.id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    paddingBottom: '15px',
                    borderBottom: '1px solid #eee',
                  }}
                >
                  <span>
                    № {o.id} от {o.date}
                  </span>
                  <span>{o.items?.length || 0} товар</span>
                  <span style={{fontWeight: '500'}}>{o.total} ₽</span>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <>
          {cartItems.length === 0 ? (
            <div style={{textAlign: 'center', marginTop: '80px'}}>
              <div style={{fontSize: '60px', marginBottom: '20px'}}>🛒</div>
              <h2 style={{margin: '0 0 10px 0'}}>Пока пусто</h2>
              <p style={{color: '#666', marginBottom: '30px'}}>
                Ознакомьтесь с новинками и хитами на главной
                <br />
                или найдите нужное в каталоге
              </p>
              <div
                style={{display: 'flex', gap: '20px', justifyContent: 'center'}}
              >
                <Link to="/catalog" className="btn-primary">
                  Перейти в каталог
                </Link>
                <Link
                  to="/"
                  style={{
                    color: 'var(--primary-blue)',
                    fontWeight: '500',
                    alignSelf: 'center',
                  }}
                >
                  Главная страница
                </Link>
              </div>
            </div>
          ) : (
            <div
              style={{display: 'flex', gap: '30px', alignItems: 'flex-start'}}
            >
              <div
                style={{
                  flex: 2,
                  background: '#fff',
                  borderRadius: '12px',
                  padding: '30px',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                }}
              >
                <div
                  style={{display: 'flex', gap: '20px', marginBottom: '20px'}}
                >
                  <label
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: '500',
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={selectedItems.length === cartItems.length}
                      onChange={() =>
                        selectedItems.length === cartItems.length
                          ? setSelectedItems([])
                          : setSelectedItems(cartItems.map((i) => i.id))
                      }
                    />{' '}
                    Выбрать все
                  </label>
                  <button
                    onClick={() => setDeleteModal('all')}
                    disabled={selectedItems.length === 0}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--pink-accent)',
                      cursor: selectedItems.length > 0 ? 'pointer' : 'default',
                      opacity: selectedItems.length > 0 ? 1 : 0.5,
                      fontSize: '14px',
                    }}
                  >
                    ✕ Удалить все
                  </button>
                </div>

                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '20px',
                  }}
                >
                  {cartItems.map((item) => (
                    <div
                      key={item.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '20px',
                        paddingBottom: '20px',
                        borderBottom: '1px solid #eee',
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={selectedItems.includes(item.id)}
                        onChange={() =>
                          setSelectedItems((prev) =>
                            prev.includes(item.id)
                              ? prev.filter((i) => i !== item.id)
                              : [...prev, item.id],
                          )
                        }
                      />
                      <img
                        src={item.image}
                        alt={item.name}
                        style={{
                          width: '80px',
                          height: '80px',
                          objectFit: 'contain',
                          background: 'var(--bg-gray)',
                          borderRadius: '8px',
                        }}
                      />
                      <div style={{flex: 1}}>
                        <p style={{margin: '0 0 10px 0', fontSize: '14px'}}>
                          {item.name}
                        </p>
                      </div>

                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '15px',
                          background: 'var(--bg-gray)',
                          borderRadius: '6px',
                          padding: '5px 10px',
                        }}
                      >
                        <button
                          onClick={() => updateCartCount(item.id, -1)}
                          style={{
                            background: 'none',
                            border: 'none',
                            fontSize: '18px',
                            cursor: 'pointer',
                            color: 'var(--primary-blue)',
                          }}
                        >
                          -
                        </button>
                        <span
                          style={{
                            fontWeight: '500',
                            width: '20px',
                            textAlign: 'center',
                          }}
                        >
                          {item.count}
                        </span>
                        <button
                          onClick={() => updateCartCount(item.id, 1)}
                          style={{
                            background: 'none',
                            border: 'none',
                            fontSize: '18px',
                            cursor: 'pointer',
                            color: 'var(--primary-blue)',
                          }}
                        >
                          +
                        </button>
                      </div>

                      <div
                        style={{
                          width: '100px',
                          textAlign: 'right',
                          fontWeight: 'bold',
                        }}
                      >
                        {item.price * item.count} ₽
                      </div>

                      <button
                        onClick={() => setDeleteModal(item.id)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'var(--pink-accent)',
                          cursor: 'pointer',
                          fontSize: '12px',
                        }}
                      >
                        ✕ Удалить
                      </button>
                    </div>
                  ))}
                </div>

                <div
                  style={{
                    textAlign: 'right',
                    marginTop: '20px',
                    fontSize: '18px',
                    fontWeight: 'bold',
                  }}
                >
                  {totalCount} товара на {totalCost} ₽
                </div>
              </div>

              <div style={{flex: 1}}>
                <h3 style={{margin: '0 0 20px 0', fontSize: '22px'}}>
                  Оформление заказа
                </h3>
                <form
                  onSubmit={submitOrder}
                  style={{
                    background: '#fff',
                    borderRadius: '12px',
                    padding: '30px',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '20px',
                  }}
                >
                  <div style={{display: 'flex', gap: '15px'}}>
                    <div style={{flex: 1}}>
                      <label
                        style={{
                          fontSize: '12px',
                          display: 'block',
                          marginBottom: '5px',
                        }}
                      >
                        Телефон{' '}
                        <span style={{color: 'var(--pink-accent)'}}>*</span>
                      </label>
                      <input
                        type="tel"
                        required
                        pattern="^[+0-9\-\(\)\s]{10,20}$"
                        title="Введите корректный номер телефона"
                        value={form.phone}
                        onChange={(e) =>
                          setForm({...form, phone: e.target.value})
                        }
                        style={{
                          width: '100%',
                          padding: '12px',
                          borderRadius: '6px',
                          border: 'none',
                          background: 'var(--bg-gray)',
                        }}
                      />
                    </div>
                    <div style={{flex: 1}}>
                      <label
                        style={{
                          fontSize: '12px',
                          display: 'block',
                          marginBottom: '5px',
                        }}
                      >
                        E-mail
                      </label>
                      <input
                        type="email"
                        value={form.email}
                        onChange={(e) =>
                          setForm({...form, email: e.target.value})
                        }
                        style={{
                          width: '100%',
                          padding: '12px',
                          borderRadius: '6px',
                          border: 'none',
                          background: 'var(--bg-gray)',
                        }}
                      />
                    </div>
                  </div>

                  <div style={{display: 'flex', gap: '20px'}}>
                    <label
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        fontSize: '14px',
                        cursor: 'pointer',
                      }}
                    >
                      <input
                        type="radio"
                        name="delivery_type"
                        checked={form.delivery === 'pickup'}
                        onChange={() => setForm({...form, delivery: 'pickup'})}
                      />{' '}
                      Самовывоз
                    </label>
                    <label
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        fontSize: '14px',
                        cursor: 'pointer',
                      }}
                    >
                      <input
                        type="radio"
                        name="delivery_type"
                        checked={form.delivery === 'delivery'}
                        onChange={() =>
                          setForm({...form, delivery: 'delivery'})
                        }
                      />{' '}
                      Доставка
                    </label>
                  </div>

                  {form.delivery === 'delivery' && (
                    <div>
                      <label
                        style={{
                          fontSize: '12px',
                          display: 'block',
                          marginBottom: '5px',
                        }}
                      >
                        Адрес доставки{' '}
                        <span style={{color: 'var(--pink-accent)'}}>*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={form.address}
                        onChange={(e) =>
                          setForm({...form, address: e.target.value})
                        }
                        style={{
                          width: '100%',
                          padding: '12px',
                          borderRadius: '6px',
                          border: 'none',
                          background: 'var(--bg-gray)',
                        }}
                      />
                    </div>
                  )}

                  <div>
                    <label
                      style={{
                        fontSize: '12px',
                        display: 'block',
                        marginBottom: '5px',
                      }}
                    >
                      Способ оплаты{' '}
                      <span style={{color: 'var(--pink-accent)'}}>*</span>
                    </label>
                    <select
                      required
                      value={form.payment}
                      onChange={(e) =>
                        setForm({...form, payment: e.target.value})
                      }
                      style={{
                        width: '100%',
                        padding: '12px',
                        borderRadius: '6px',
                        border: 'none',
                        background: 'var(--bg-gray)',
                      }}
                    >
                      <option value="">Не выбрано</option>
                      <option value="card">По карте</option>
                      <option value="cash">Наличными</option>
                    </select>
                  </div>

                  <label
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      fontSize: '14px',
                      cursor: 'pointer',
                      fontWeight: '500',
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={form.packaging}
                      onChange={(e) =>
                        setForm({...form, packaging: e.target.checked})
                      }
                    />{' '}
                    Нужна ли упаковка
                  </label>

                  <button
                    type="submit"
                    className="btn-primary"
                    disabled={selectedItems.length === 0}
                    style={{
                      padding: '15px',
                      fontSize: '16px',
                      opacity: selectedItems.length === 0 ? 0.5 : 1,
                    }}
                  >
                    Оформить заказ
                  </button>
                </form>
              </div>
            </div>
          )}
        </>
      )}

      {deleteModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
          onClick={() => setDeleteModal(null)}
        >
          <div
            style={{
              background: '#fff',
              padding: '30px',
              borderRadius: '16px',
              width: '400px',
              textAlign: 'center',
              position: 'relative',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setDeleteModal(null)}
              style={{
                position: 'absolute',
                top: 15,
                right: 15,
                background: 'none',
                border: 'none',
                fontSize: '20px',
                color: '#999',
                cursor: 'pointer',
              }}
            >
              ✕
            </button>
            <h3 style={{margin: '20px 0', fontSize: '18px'}}>
              Вы уверены, что хотите удалить?
            </h3>
            <div
              style={{
                display: 'flex',
                gap: '20px',
                justifyContent: 'center',
                marginTop: '30px',
              }}
            >
              <button
                onClick={() => setDeleteModal(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--pink-accent)',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                }}
              >
                Отмена
              </button>
              <button onClick={confirmDelete} className="btn-primary">
                Да, удалить
              </button>
            </div>
          </div>
        </div>
      )}

      {successModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
          onClick={() => setSuccessModal(false)}
        >
          <div
            style={{
              background: '#fff',
              padding: '40px',
              borderRadius: '16px',
              width: '420px',
              textAlign: 'center',
              position: 'relative',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSuccessModal(false)}
              style={{
                position: 'absolute',
                top: 15,
                right: 15,
                background: 'none',
                border: 'none',
                fontSize: '20px',
                color: '#999',
                cursor: 'pointer',
              }}
            >
              ✕
            </button>
            <div style={{fontSize: '48px', marginBottom: '15px'}}>🎉</div>
            <h2 style={{margin: '0 0 25px 0', fontSize: '20px'}}>
              Спасибо, ваш заказ успешно оформлен
            </h2>
            <button
              onClick={() => {
                setSuccessModal(false);
                setActiveTab('history');
              }}
              className="btn-primary"
              style={{width: '100%'}}
            >
              Ок
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
