import React, { useState, useEffect, useMemo } from 'react';

const API_URL = 'http://localhost:8080';
const CART_STORAGE_KEY = 'gadget_hub_cart';
const AUTH_STORAGE_KEY = 'gadget_hub_user';

const PRODUCT_TYPES = [
  'Смартфоны',
  'Фитнес браслеты',
  'Портативная акустика',
  'Очки виртуальной реальности',
  'Электротранспорт',
  'Умные часы',
  'Наушники',
  'Аксессуары'
];

const PRODUCT_COLORS = [
  'Красный',
  'Оранжевый',
  'Желтый',
  'Зеленый',
  'Голубой',
  'Синий',
  'Фиолетовый',
  'Черный',
  'Белый',
  'Серый'
];

export default function App() {
  const [page, setPage] = useState('home'); // 'home' | 'login' | 'catalog' | 'cart'
  const [user, setUser] = useState(() => localStorage.getItem(AUTH_STORAGE_KEY) || null);
  const [goods, setGoods] = useState([]);
  const [orders, setOrders] = useState([]);

  // Корзина в localStorage: [{ id, quantity, checked }]
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Модальное окно карточки товара
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Карусели на главной
  const [hitIndex, setHitIndex] = useState(0);
  const [newIndex, setNewIndex] = useState(0);

  // Состояния формы логина
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginErrors, setLoginErrors] = useState({ username: false, password: false });
  const [loginServerError, setLoginServerError] = useState('');

  // Фильтры каталога (черновик формы и примененные)
  const [draftPriceFrom, setDraftPriceFrom] = useState('');
  const [draftPriceTo, setDraftPriceTo] = useState('');
  const [draftTypes, setDraftTypes] = useState([]);
  const [draftColors, setDraftColors] = useState([]);

  const [appliedFilters, setAppliedFilters] = useState({
    priceFrom: '',
    priceTo: '',
    types: [],
    colors: []
  });

  // Сортировка и пагинация
  const [sortBy, setSortBy] = useState('new'); // 'new' | 'popular' | 'price_asc' | 'price_desc'
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 9;

  // Вкладки на странице корзины ('cart' | 'history')
  const [cartTab, setCartTab] = useState('cart');

  // Подтверждение удаления из корзины
  const [deleteConfirmModal, setDeleteConfirmModal] = useState(null); // { mode: 'single' | 'selected', product }

  // Модалка успешного заказа
  const [orderSuccessModal, setOrderSuccessModal] = useState(null); // orderId

  // Поля оформления заказа
  const [orderPhone, setOrderPhone] = useState('');
  const [orderEmail, setOrderEmail] = useState('');
  const [deliveryType, setDeliveryType] = useState('pickup'); // 'pickup' | 'delivery'
  const [orderAddress, setOrderAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('По карте');
  const [needPackaging, setNeedPackaging] = useState(false);
  const [orderErrors, setOrderErrors] = useState({ phone: false, address: false });

  // Загрузка товаров с бекенда
  useEffect(() => {
    fetch(`${API_URL}/goods`)
      .then((res) => res.json())
      .then((data) => setGoods(data))
      .catch((err) => console.error('Ошибка загрузки товаров:', err));
  }, []);

  // Загрузка истории заказов
  const fetchOrders = () => {
    fetch(`${API_URL}/orders`)
      .then((res) => res.json())
      .then((data) => setOrders(data))
      .catch((err) => console.error('Ошибка загрузки заказов:', err));
  };

  useEffect(() => {
    if (user) {
      fetchOrders();
    }
  }, [user]);

  // Синхронизация корзины с localStorage
  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  }, [cart]);

  // Закрытие модального окна по кнопке Esc
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setSelectedProduct(null);
        setDeleteConfirmModal(null);
        setLoginServerError('');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Навигация с защитой роутов (незалогиненному доступны только Главная и Логин)
  const navigateTo = (targetPage) => {
    if ((targetPage === 'catalog' || targetPage === 'cart') && !user) {
      setPage('login');
      return;
    }
    setPage(targetPage);
    window.scrollTo(0, 0);
  };

  // Работа с корзиной
  const getQuantity = (productId) => {
    const found = cart.find((item) => item.id === productId);
    return found ? found.quantity : 0;
  };

  const addToCart = (productId) => {
    if (!user) {
      setPage('login');
      return;
    }
    setCart((prev) => {
      const existing = prev.find((item) => item.id === productId);
      if (existing) {
        return prev.map((item) =>
          item.id === productId ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { id: productId, quantity: 1, checked: true }];
    });
  };

  const changeQuantity = (productId, delta) => {
    setCart((prev) =>
      prev
        .map((item) =>
          item.id === productId ? { ...item, quantity: item.quantity + delta } : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const totalCartItemsCount = useMemo(
    () => cart.reduce((sum, item) => sum + item.quantity, 0),
    [cart]
  );

  // Обработка логина
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    const errors = {
      username: !loginUsername.trim(),
      password: !loginPassword.trim()
    };
    setLoginErrors(errors);

    if (errors.username || errors.password) {
      return;
    }

    try {
      const res = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: loginUsername.trim(), password: loginPassword.trim() })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setLoginServerError(
          data.message ||
            'такого пользователя нет, возможно неправильный логин или пароль проверьте данные'
        );
        return;
      }
      localStorage.setItem(AUTH_STORAGE_KEY, data.username);
      setUser(data.username);
      setLoginUsername('');
      setLoginPassword('');
      setLoginServerError('');
      setPage('home');
    } catch {
      setLoginServerError('Ошибка соединения с сервером');
    }
  };

  const handleLogout = async () => {
    await fetch(`${API_URL}/logout`, { method: 'POST' }).catch(() => {});
    localStorage.removeItem(AUTH_STORAGE_KEY);
    setUser(null);
    setPage('home');
  };

  // Хиты и Новинки для каруселей на главной
  const hitGoods = useMemo(() => goods.filter((g) => g.isHit), [goods]);
  const newGoods = useMemo(() => goods.filter((g) => g.isNew), [goods]);

  const getCarouselSlice = (list, startIndex) => {
    if (list.length === 0) return [];
    const result = [];
    const count = Math.min(3, list.length);
    for (let i = 0; i < count; i++) {
      result.push(list[(startIndex + i) % list.length]);
    }
    return result;
  };

  // Фильтрация и сортировка каталога
  const filteredAndSortedGoods = useMemo(() => {
    let result = [...goods];

    const minP = parseFloat(appliedFilters.priceFrom);
    const maxP = parseFloat(appliedFilters.priceTo);

    if (!Number.isNaN(minP)) {
      result = result.filter((g) => g.price >= minP);
    }
    if (!Number.isNaN(maxP)) {
      result = result.filter((g) => g.price <= maxP);
    }
    if (appliedFilters.types.length > 0) {
      result = result.filter((g) => appliedFilters.types.includes(g.type));
    }
    if (appliedFilters.colors.length > 0) {
      result = result.filter((g) => appliedFilters.colors.includes(g.color));
    }

    result.sort((a, b) => {
      if (sortBy === 'new') {
        return Number(b.isNew) - Number(a.isNew) || a.id - b.id;
      }
      if (sortBy === 'popular') {
        return b.rating - a.rating;
      }
      if (sortBy === 'price_asc') {
        return a.price - b.price;
      }
      if (sortBy === 'price_desc') {
        return b.price - a.price;
      }
      return 0;
    });

    return result;
  }, [goods, appliedFilters, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filteredAndSortedGoods.length / ITEMS_PER_PAGE));
  const paginatedGoods = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredAndSortedGoods.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredAndSortedGoods, currentPage]);

  const handleApplyFilters = (e) => {
    e.preventDefault();
    setAppliedFilters({
      priceFrom: draftPriceFrom,
      priceTo: draftPriceTo,
      types: draftTypes,
      colors: draftColors
    });
    setCurrentPage(1);
  };

  const handleResetFilters = () => {
    setDraftPriceFrom('');
    setDraftPriceTo('');
    setDraftTypes([]);
    setDraftColors([]);
    setAppliedFilters({ priceFrom: '', priceTo: '', types: [], colors: [] });
    setCurrentPage(1);
  };

  const toggleCheckboxList = (list, setList, value) => {
    if (list.includes(value)) {
      setList(list.filter((item) => item !== value));
    } else {
      setList([...list, value]);
    }
  };

  // Детализированные товары в корзине
  const cartDetailed = useMemo(() => {
    return cart
      .map((c) => {
        const product = goods.find((g) => g.id === c.id);
        return product ? { ...product, quantity: c.quantity, checked: c.checked } : null;
      })
      .filter(Boolean);
  }, [cart, goods]);

  const allChecked = cartDetailed.length > 0 && cartDetailed.every((item) => item.checked);
  const selectedCartItems = cartDetailed.filter((item) => item.checked);
  const totalCartPrice = cartDetailed.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const totalCartUnits = cartDetailed.reduce((sum, item) => sum + item.quantity, 0);

  const toggleAllCart = (checked) => {
    setCart((prev) => prev.map((item) => ({ ...item, checked })));
  };

  const toggleCartItemCheck = (id) => {
    setCart((prev) =>
      prev.map((item) => (item.id === id ? { ...item, checked: !item.checked } : item))
    );
  };

  const confirmDeleteAction = () => {
    if (!deleteConfirmModal) return;
    if (deleteConfirmModal.mode === 'single') {
      setCart((prev) => prev.filter((item) => item.id !== deleteConfirmModal.product.id));
    } else if (deleteConfirmModal.mode === 'selected') {
      setCart((prev) => prev.filter((item) => !item.checked));
    }
    setDeleteConfirmModal(null);
  };

  // Оформление заказа
  const handleOrderSubmit = async (e) => {
    e.preventDefault();
    const errors = {
      phone: !orderPhone.trim(),
      address: deliveryType === 'delivery' && !orderAddress.trim()
    };
    setOrderErrors(errors);

    if (errors.phone || errors.address) {
      return;
    }

    try {
      const res = await fetch(`${API_URL}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: cartDetailed,
          customer: {
            phone: orderPhone.trim(),
            email: orderEmail.trim(),
            deliveryType,
            address: deliveryType === 'delivery' ? orderAddress.trim() : 'Самовывоз',
            paymentMethod,
            needPackaging
          }
        })
      });
      const newOrder = await res.json();
      if (res.ok) {
        setCart([]);
        localStorage.removeItem(CART_STORAGE_KEY);
        setOrderPhone('');
        setOrderEmail('');
        setOrderAddress('');
        setNeedPackaging(false);
        fetchOrders();
        setOrderSuccessModal(newOrder.id);
      }
    } catch (err) {
      console.error('Ошибка отправки заказа:', err);
    }
  };

  // Формирование номеров страниц пагинации (по ТЗ: если > 3, то 1, 2, 3, ..., последняя)
  const renderPaginationNumbers = () => {
    if (totalPages <= 4) {
      return Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => (
        <button
          key={num}
          type="button"
          className={`page-btn ${currentPage === num ? 'active' : ''}`}
          onClick={() => setCurrentPage(num)}
        >
          {num}
        </button>
      ));
    }
    return (
      <>
        {[1, 2, 3].map((num) => (
          <button
            key={num}
            type="button"
            className={`page-btn ${currentPage === num ? 'active' : ''}`}
            onClick={() => setCurrentPage(num)}
          >
            {num}
          </button>
        ))}
        <span className="page-dots">...</span>
        <button
          type="button"
          className={`page-btn ${currentPage === totalPages ? 'active' : ''}`}
          onClick={() => setCurrentPage(totalPages)}
        >
          {totalPages}
        </button>
      </>
    );
  };

  return (
    <div className="site-wrapper">
      {/* ШАПКА САЙТА */}
      <header className="site-header">
        <div className="container header-inner">
          <div
            className="logo"
            onClick={() => {
              if (page !== 'home') navigateTo('home');
            }}
            style={{ cursor: page !== 'home' ? 'pointer' : 'default' }}
          >
            <span className="logo-text">Gadget Hub</span>
          </div>

          <nav className="header-nav">
            <button
              type="button"
              className={`nav-btn ${page === 'catalog' ? 'active' : ''}`}
              onClick={() => navigateTo('catalog')}
            >
              <span className="nav-icon">☷</span> Каталог
            </button>

            {user && (
              <button
                type="button"
                className={`nav-btn ${page === 'cart' ? 'active' : ''}`}
                onClick={() => navigateTo('cart')}
              >
                <span className="nav-icon">🛒</span> Корзина
                {totalCartItemsCount > 0 && (
                  <span className="cart-badge">{totalCartItemsCount}</span>
                )}
              </button>
            )}

            {!user ? (
              <button
                type="button"
                className={`nav-btn ${page === 'login' ? 'active' : ''}`}
                onClick={() => setPage('login')}
              >
                <span className="nav-icon">👤</span> Войти
              </button>
            ) : (
              <button type="button" className="nav-btn" onClick={handleLogout}>
                <span className="nav-icon">↪</span> Выйти
              </button>
            )}
          </nav>
        </div>
      </header>

      {/* ОСНОВНОЙ КОНТЕНТ */}
      <main className="main-content">
        {/* СТРАНИЦА 1: ГЛАВНАЯ */}
        {page === 'home' && (
          <div className="container">
            <section className="hero-banner">
              <div className="hero-text">
                <div className="hero-sale">SUPER SALE</div>
                <div className="hero-discount">
                  <span className="discount-percent">-10%</span>
                  <span className="discount-price">27990 ₽</span>
                  <span className="discount-old">31100 ₽</span>
                </div>
                <p className="hero-subtitle">Умный робот-друг Red solution Reddy Air</p>
              </div>
              <div className="hero-img-box">
                <img
                  src="/goods/16.png"
                  alt="Hero"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>
            </section>

            {/* Карусель: Хиты продаж */}
            <section className="carousel-section">
              <div className="carousel-info">
                <div className="section-icon hit-icon">🔥</div>
                <h2>Хиты продаж</h2>
                <p>
                  Тысячи покупателей уже одобрили эти товары. Самые популярные, проверенные и
                  надежные гаджеты!
                </p>
              </div>

              <div className="carousel-Wrap">
                <button
                  type="button"
                  className="carousel-arrow"
                  onClick={() =>
                    setHitIndex((prev) => (prev - 1 + hitGoods.length) % hitGoods.length)
                  }
                >
                  ‹
                </button>
                <div className="carousel-cards">
                  {getCarouselSlice(hitGoods, hitIndex).map((item) => (
                    <div
                      key={item.id}
                      className="product-card"
                      onClick={() => setSelectedProduct(item)}
                    >
                      <div className="card-img-wrap">
                        <div className="badges">
                          {item.isNew && <span className="badge badge-new">Новинка</span>}
                          {item.isHit && <span className="badge badge-hit">Хит</span>}
                        </div>
                        <img
                          src={item.image}
                          alt={item.name}
                          onError={(e) => {
                            e.currentTarget.src =
                              'https://placehold.co/220x220/f2f4f8/333?text=Gadget';
                          }}
                        />
                      </div>
                      <div className="card-price">{item.price} ₽</div>
                      <div className="card-title" title={item.name}>
                        {item.name}
                      </div>
                      <div className="card-rating">⭐ {item.rating}</div>
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  className="carousel-arrow"
                  onClick={() => setHitIndex((prev) => (prev + 1) % hitGoods.length)}
                >
                  ›
                </button>
              </div>
            </section>

            {/* Карусель: Новинки */}
            <section className="carousel-section">
              <div className="carousel-info">
                <div className="section-icon new-icon">✨</div>
                <h2>Новинки</h2>
                <p>
                  Их только произвели — они уже у нас! Все самое новое и свежее на рынке
                  электроники
                </p>
              </div>

              <div className="carousel-Wrap">
                <button
                  type="button"
                  className="carousel-arrow"
                  onClick={() =>
                    setNewIndex((prev) => (prev - 1 + newGoods.length) % newGoods.length)
                  }
                >
                  ‹
                </button>
                <div className="carousel-cards">
                  {getCarouselSlice(newGoods, newIndex).map((item) => (
                    <div
                      key={item.id}
                      className="product-card"
                      onClick={() => setSelectedProduct(item)}
                    >
                      <div className="card-img-wrap">
                        <div className="badges">
                          {item.isNew && <span className="badge badge-new">Новинка</span>}
                          {item.isHit && <span className="badge badge-hit">Хит</span>}
                        </div>
                        <img
                          src={item.image}
                          alt={item.name}
                          onError={(e) => {
                            e.currentTarget.src =
                              'https://placehold.co/220x220/f2f4f8/333?text=Gadget';
                          }}
                        />
                      </div>
                      <div className="card-price">{item.price} ₽</div>
                      <div className="card-title" title={item.name}>
                        {item.name}
                      </div>
                      <div className="card-rating">⭐ {item.rating}</div>
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  className="carousel-arrow"
                  onClick={() => setNewIndex((prev) => (prev + 1) % newGoods.length)}
                >
                  ›
                </button>
              </div>
            </section>

            {/* Преимущества */}
            <section className="benefits-section">
              <h2>Преимущества</h2>
              <div className="benefits-grid">
                <div className="benefit-card">
                  <div className="benefit-icon">🚀</div>
                  <p>Утром заказали, вечером получили</p>
                </div>
                <div className="benefit-card">
                  <div className="benefit-icon">🔄</div>
                  <p>С товаром что-то не так? Вернем деньги</p>
                </div>
                <div className="benefit-card">
                  <div className="benefit-icon">✅</div>
                  <p>Только оригинальные товары</p>
                </div>
              </div>
            </section>

            {/* Контакты компании */}
            <section className="contacts-section">
              <div className="contacts-card">
                <h3>Работаем 24/7</h3>
                <p>📞 8 (800) 678-34-24</p>
                <p>✉️ gadget@hub.ru</p>
                <p>📍 Санкт-Петербург, ул. Барочная, д.7, корпус 2</p>
              </div>
            </section>
          </div>
        )}

        {/* СТРАНИЦА 2: ЛОГИН */}
        {page === 'login' && (
          <div className="login-page-bg">
            <div className="login-box">
              <h2>Добро пожаловать!</h2>
              <form onSubmit={handleLoginSubmit} noValidate>
                <div className="form-field">
                  <label>
                    Логин <span className="req">*</span>
                  </label>
                  <input
                    type="text"
                    value={loginUsername}
                    onChange={(e) => {
                      setLoginUsername(e.target.value);
                      setLoginErrors((p) => ({ ...p, username: false }));
                    }}
                    className={loginErrors.username ? 'input-error' : ''}
                    placeholder="Введите логин (admin)"
                  />
                  {loginErrors.username && (
                    <span className="error-text">Заполните обязательное поле</span>
                  )}
                </div>

                <div className="form-field">
                  <label>
                    Пароль <span className="req">*</span>
                  </label>
                  <input
                    type="password"
                    value={loginPassword}
                    onChange={(e) => {
                      setLoginPassword(e.target.value);
                      setLoginErrors((p) => ({ ...p, password: false }));
                    }}
                    className={loginErrors.password ? 'input-error' : ''}
                    placeholder="Введите пароль (123)"
                  />
                  {loginErrors.password && (
                    <span className="error-text">Заполните обязательное поле</span>
                  )}
                </div>

                <button type="submit" className="btn-blue">
                  Войти
                </button>
              </form>
            </div>
          </div>
        )}

        {/* СТРАНИЦА 3: КАТАЛОГ ТОВАРОВ */}
        {page === 'catalog' && (
          <div className="container catalog-page">
            <h1>Каталог товаров</h1>

            {/* Блок сортировки */}
            <div className="sort-bar">
              <button
                type="button"
                className={`sort-chip ${sortBy === 'new' ? 'active' : ''}`}
                onClick={() => setSortBy('new')}
              >
                Новые
              </button>
              <button
                type="button"
                className={`sort-chip ${sortBy === 'popular' ? 'active' : ''}`}
                onClick={() => setSortBy('popular')}
              >
                Популярные
              </button>
              <button
                type="button"
                className={`sort-chip ${sortBy === 'price_asc' ? 'active' : ''}`}
                onClick={() => setSortBy('price_asc')}
              >
                Подешевле
              </button>
              <button
                type="button"
                className={`sort-chip ${sortBy === 'price_desc' ? 'active' : ''}`}
                onClick={() => setSortBy('price_desc')}
              >
                Подороже
              </button>
            </div>

            <div className="catalog-layout">
              {/* Сетка по 3 карточки в ряду */}
              <div className="catalog-main">
                {paginatedGoods.length === 0 ? (
                  <div className="empty-catalog-msg">
                    Товары по вашему запросу не найдены. Попробуйте изменить параметры фильтрации.
                  </div>
                ) : (
                  <div className="catalog-grid">
                    {paginatedGoods.map((item) => {
                      const qty = getQuantity(item.id);
                      return (
                        <div
                          key={item.id}
                          className="product-card"
                          onClick={() => setSelectedProduct(item)}
                        >
                          <div className="card-img-wrap">
                            <div className="badges">
                              {item.isNew && <span className="badge badge-new">Новинка</span>}
                              {item.isHit && <span className="badge badge-hit">Хит</span>}
                            </div>
                            <img
                              src={item.image}
                              alt={item.name}
                              onError={(e) => {
                                e.currentTarget.src =
                                  'https://placehold.co/220x220/f2f4f8/333?text=Gadget';
                              }}
                            />
                          </div>
                          <div className="card-price">{item.price} ₽</div>
                          <div className="card-title" title={item.name}>
                            {item.name}
                          </div>
                          <div className="card-rating">⭐ {item.rating}</div>

                          <div
                            className="card-actions"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {qty === 0 ? (
                              <button
                                type="button"
                                className="btn-blue"
                                onClick={() => addToCart(item.id)}
                              >
                                🛒 В корзину
                              </button>
                            ) : (
                              <div className="card-qty-row">
                                <span className="btn-pink">🛒 {qty} шт.</span>
                                <div className="qty-controls">
                                  <button
                                    type="button"
                                    onClick={() => changeQuantity(item.id, -1)}
                                  >
                                    −
                                  </button>
                                  <span>{qty}</span>
                                  <button
                                    type="button"
                                    onClick={() => changeQuantity(item.id, 1)}
                                  >
                                    +
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Пагинация */}
                {filteredAndSortedGoods.length > ITEMS_PER_PAGE && (
                  <div className="pagination">
                    {renderPaginationNumbers()}
                    <button
                      type="button"
                      className="page-btn"
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    >
                      ›
                    </button>
                  </div>
                )}
              </div>

              {/* Правая колонка: Фильтры */}
              <aside className="catalog-Filters">
                <form onSubmit={handleApplyFilters}>
                  <div className="filter-block">
                    <h3>Цена, ₽</h3>
                    <div className="price-inputs">
                      <div>
                        <label>От</label>
                        <input
                          type="number"
                          placeholder="590"
                          value={draftPriceFrom}
                          onChange={(e) => setDraftPriceFrom(e.target.value)}
                        />
                      </div>
                      <div>
                        <label>До</label>
                        <input
                          type="number"
                          placeholder="64990"
                          value={draftPriceTo}
                          onChange={(e) => setDraftPriceTo(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="filter-block">
                    <h3>Тип товара</h3>
                    {PRODUCT_TYPES.map((t) => (
                      <label key={t} className="checkbox-label">
                        <input
                          type="checkbox"
                          checked={draftTypes.includes(t)}
                          onChange={() => toggleCheckboxList(draftTypes, setDraftTypes, t)}
                        />
                        <span>{t}</span>
                      </label>
                    ))}
                  </div>

                  <div className="filter-block">
                    <h3>Цвет</h3>
                    {PRODUCT_COLORS.map((c) => (
                      <label key={c} className="checkbox-label">
                        <input
                          type="checkbox"
                          checked={draftColors.includes(c)}
                          onChange={() => toggleCheckboxList(draftColors, setDraftColors, c)}
                        />
                        <span>{c}</span>
                      </label>
                    ))}
                  </div>

                  <div className="filter-buttons">
                    <button type="submit" className="btn-blue">
                      Показать
                    </button>
                    <button
                      type="button"
                      className="btn-reset"
                      onClick={handleResetFilters}
                    >
                      Сбросить
                    </button>
                  </div>
                </form>
              </aside>
            </div>
          </div>
        )}

        {/* СТРАНИЦА 4: КОРЗИНА И ИСТОРИЯ ЗАКАЗОВ */}
        {page === 'cart' && (
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
                    <button
                      type="button"
                      className="btn-blue"
                      onClick={() => navigateTo('catalog')}
                    >
                      Перейти в каталог
                    </button>
                    <button
                      type="button"
                      className="btn-link"
                      onClick={() => navigateTo('home')}
                    >
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
                          onChange={(e) => toggleAllCart(e.target.checked)}
                        />
                        <span>Выбрать все</span>
                      </label>

                      {selectedCartItems.length > 0 && (
                        <button
                          type="button"
                          className="delete-link"
                          onClick={() =>
                            setDeleteConfirmModal({ mode: 'selected', product: null })
                          }
                        >
                          ✕ Удалить выбранные
                        </button>
                      )}
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
                          onError={(e) => {
                            e.currentTarget.src =
                              'https://placehold.co/80x80/f2f4f8/333?text=Gadget';
                          }}
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
                        {totalCartUnits} товара на {totalCartPrice} ₽
                      </strong>
                    </div>
                  </div>

                  {/* Оформление заказа */}
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
                            onChange={(e) => {
                              setOrderPhone(e.target.value);
                              setOrderErrors((p) => ({ ...p, phone: false }));
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
                            onChange={(e) => setOrderEmail(e.target.value)}
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
                            onChange={(e) => {
                              setOrderAddress(e.target.value);
                              setOrderErrors((p) => ({ ...p, address: false }));
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
                          onChange={(e) => setPaymentMethod(e.target.value)}
                        >
                          <option value="По карте">По карте</option>
                          <option value="Наличными">Наличными</option>
                        </select>
                      </div>

                      <label className="checkbox-label packaging-check">
                        <input
                          type="checkbox"
                          checked={needPackaging}
                          onChange={(e) => setNeedPackaging(e.target.checked)}
                        />
                        <span>Нужна упаковка</span>
                      </label>

                      <button type="submit" className="btn-blue">
                        Оформить заказ
                      </button>
                    </form>
                  </section>
                </>
              )
            ) : (
              /* ВКЛАДКА: ИСТОРИЯ ЗАКАЗОВ */
              <div className="orders-history-list">
                {orders.length === 0 ? (
                  <p>Заказов пока нет.</p>
                ) : (
                  orders.map((o) => (
                    <div key={o.id} className="order-history-row">
                      <span className="order-num">
                        №{o.id} от {o.date}
                      </span>
                      <span className="order-cnt">{o.totalCount} товара</span>
                      <strong className="order-sum">{o.totalPrice} ₽</strong>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        )}
      </main>

      {/* МОДАЛЬНОЕ ОКНО КАРТОЧКИ ТОВАРА */}
      {selectedProduct && (
        <div className="modal-overlay" onClick={() => setSelectedProduct(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="modal-close"
              onClick={() => setSelectedProduct(null)}
            >
              ✕
            </button>
            <div className="modal-body">
              <div className="modal-img-box">
                <div className="badges">
                  {selectedProduct.isNew && <span className="badge badge-new">Новинка</span>}
                  {selectedProduct.isHit && <span className="badge badge-hit">Хит</span>}
                </div>
                <img
                  src={selectedProduct.image}
                  alt={selectedProduct.name}
                  onError={(e) => {
                    e.currentTarget.src =
                      'https://placehold.co/300x300/f2f4f8/333?text=Gadget';
                  }}
                />
              </div>

              <div className="modal-details">
                <h2>{selectedProduct.name}</h2>
                <div className="card-rating">⭐ {selectedProduct.rating}</div>
                <p className="modal-desc">{selectedProduct.description}</p>

                <h3>Характеристики</h3>
                <div className="specs-list">
                  {Object.entries(selectedProduct.specs || {}).map(([key, val]) => (
                    <div key={key} className="spec-row">
                      <span className="spec-key">{key}</span>
                      <span className="spec-dots" />
                      <span className="spec-val">{val}</span>
                    </div>
                  ))}
                </div>

                <div className="modal-footer-price">
                  <div className="modal-price">{selectedProduct.price} ₽</div>
                  {getQuantity(selectedProduct.id) === 0 ? (
                    <button
                      type="button"
                      className="btn-blue"
                      onClick={() => addToCart(selectedProduct.id)}
                    >
                      🛒 В корзину
                    </button>
                  ) : (
                    <div className="card-qty-row">
                      <div className="qty-controls">
                        <button
                          type="button"
                          onClick={() => changeQuantity(selectedProduct.id, -1)}
                        >
                          −
                        </button>
                        <span>{getQuantity(selectedProduct.id)}</span>
                        <button
                          type="button"
                          onClick={() => changeQuantity(selectedProduct.id, 1)}
                        >
                          +
                        </button>
                      </div>
                      <span className="btn-pink">
                        🛒 В корзине {getQuantity(selectedProduct.id)} шт.
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* POP-UP ОШИБКИ ЛОГИНА */}
      {loginServerError && (
        <div className="modal-overlay" onClick={() => setLoginServerError('')}>
          <div className="confirm-modal" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="modal-close"
              onClick={() => setLoginServerError('')}
            >
              ✕
            </button>
            <h3>Ошибка авторизации</h3>
            <p>{loginServerError}</p>
            <div className="confirm-actions">
              <button
                type="button"
                className="btn-blue"
                onClick={() => setLoginServerError('')}
              >
                Ок
              </button>
            </div>
          </div>
        </div>
      )}

      {/* POP-UP ПОДТВЕРЖДЕНИЯ УДАЛЕНИЯ ИЗ КОРЗИНЫ */}
      {deleteConfirmModal && (
        <div className="modal-overlay" onClick={() => setDeleteConfirmModal(null)}>
          <div className="confirm-modal" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="modal-close"
              onClick={() => setDeleteConfirmModal(null)}
            >
              ✕
            </button>
            <h3>
              Вы уверены, что хотите удалить{' '}
              {deleteConfirmModal.mode === 'single'
                ? deleteConfirmModal.product.name
                : 'выбранные товары'}
              ?
            </h3>
            <div className="confirm-actions">
              <button
                type="button"
                className="btn-reset"
                onClick={() => setDeleteConfirmModal(null)}
              >
                Отмена
              </button>
              <button type="button" className="btn-blue" onClick={confirmDeleteAction}>
                Да, удалить
              </button>
            </div>
          </div>
        </div>
      )}

      {/* POP-UP УСПЕШНОГО ЗАКАЗА */}
      {orderSuccessModal && (
        <div className="modal-overlay" onClick={() => setOrderSuccessModal(null)}>
          <div className="confirm-modal" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="modal-close"
              onClick={() => setOrderSuccessModal(null)}
            >
              ✕
            </button>
            <h3>Спасибо, ваш заказ успешно оформлен!</h3>
            <p>Номер заказа {orderSuccessModal}.</p>
            <p>
              Мы свяжемся с вами в течение 10 минут, чтобы уточнить удобное для вас время
              доставки.
            </p>
            <div className="confirm-actions">
              <button
                type="button"
                className="btn-blue"
                onClick={() => setOrderSuccessModal(null)}
              >
                Ок
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ПОДВАЛ САЙТА */}
      <footer className="site-footer">
        <div className="container footer-inner">
          <div>
            <div className="logo-text">Gadget Hub</div>
            <p className="footer-sub">Магазин надежных гаджетов</p>
            <p className="footer-copy">© 2024 ООО «Гаджет Хаб». Все права защищены</p>
          </div>
          <div className="footer-contacts">
            <span className="footer-phone">8 (800) 678-34-24</span>
            <div className="social-links">
              <a href="https://vk.com" target="_blank" rel="noreferrer" className="social-circle">
                VK
              </a>
              <a href="https://t.me" target="_blank" rel="noreferrer" className="social-circle">
                TG
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noreferrer"
                className="social-circle"
              >
                YT
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}