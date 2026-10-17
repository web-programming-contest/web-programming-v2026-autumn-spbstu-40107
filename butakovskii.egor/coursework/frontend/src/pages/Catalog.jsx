import {useState, useEffect, useMemo} from 'react';

export default function Catalog() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState(() =>
    JSON.parse(localStorage.getItem('cart') || '{}'),
  );

  const [filters, setFilters] = useState({
    priceFrom: '',
    priceTo: '',
    types: [],
    colors: [],
  });
  const [appliedFilters, setAppliedFilters] = useState({
    priceFrom: '',
    priceTo: '',
    types: [],
    colors: [],
  });
  const [sort, setSort] = useState('new');
  const [modalItem, setModalItem] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 9;

  useEffect(() => {
    fetch('/api/goods')
      .then((r) => r.json())
      .then(setProducts);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setModalItem(null);
      }
    };
    if (modalItem) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [modalItem]);

  const updateCart = (id, delta) => {
    const newCart = {...cart};
    if (!newCart[id]) newCart[id] = 0;
    newCart[id] += delta;
    if (newCart[id] <= 0) delete newCart[id];
    setCart(newCart);
    localStorage.setItem('cart', JSON.stringify(newCart));
    window.dispatchEvent(new Event('storage'));
  };

  const toggleFilter = (field, value) => {
    setFilters((prev) => {
      const list = prev[field];
      const updated = list.includes(value)
        ? list.filter((item) => item !== value)
        : [...list, value];
      return {...prev, [field]: updated};
    });
  };

  const processedProducts = useMemo(() => {
    let result = [...products];

    if (appliedFilters.priceFrom)
      result = result.filter(
        (p) => p.price >= Number(appliedFilters.priceFrom),
      );
    if (appliedFilters.priceTo)
      result = result.filter((p) => p.price <= Number(appliedFilters.priceTo));
    if (appliedFilters.types.length > 0)
      result = result.filter((p) => appliedFilters.types.includes(p.type));
    if (appliedFilters.colors.length > 0)
      result = result.filter((p) => appliedFilters.colors.includes(p.color));

    result.sort((a, b) => {
      if (sort === 'cheap') return a.price - b.price;
      if (sort === 'expensive') return b.price - a.price;
      if (sort === 'popular') return b.rating - a.rating;
      return b.id - a.id;
    });

    return result;
  }, [products, appliedFilters, sort]);

  useEffect(() => {
    setCurrentPage(1);
  }, [appliedFilters, sort]);

  const totalPages = Math.ceil(processedProducts.length / ITEMS_PER_PAGE);
  const currentProducts = processedProducts.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    let pages = [];
    if (totalPages > 3) {
      pages = [1, 2, 3, '...', totalPages];
    } else {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    }

    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '10px',
          marginTop: '40px',
        }}
      >
        {pages.map((p, i) => (
          <button
            key={i}
            onClick={() => p !== '...' && setCurrentPage(p)}
            style={{
              border: 'none',
              background:
                p === currentPage ? 'var(--primary-blue)' : 'transparent',
              color: p === currentPage ? '#fff' : 'var(--primary-blue)',
              fontWeight: 'bold',
              cursor: p !== '...' ? 'pointer' : 'default',
              padding: '8px 12px',
              borderRadius: '6px',
            }}
          >
            {p}
          </button>
        ))}
      </div>
    );
  };

  const availableTypes = [
    {id: 'smartphones', label: 'Смартфоны'},
    {id: 'headphones', label: 'Наушники'},
    {id: 'watches', label: 'Умные часы'},
    {id: 'accessories', label: 'Аксессуары'},
    {id: 'acoustics', label: 'Акустика'},
  ];

  const availableColors = [
    {id: 'black', label: 'Черный'},
    {id: 'white', label: 'Белый'},
    {id: 'purple', label: 'Фиолетовый'},
    {id: 'blue', label: 'Синий'},
    {id: 'gray', label: 'Серый'},
  ];

  return (
    <div className="container" style={{marginTop: '30px'}}>
      <h1 style={{fontSize: '28px', marginBottom: '20px'}}>Каталог товаров</h1>

      <div style={{display: 'flex', gap: '30px'}}>
        <div style={{flex: 1}}>
          <div
            style={{
              display: 'flex',
              gap: '20px',
              marginBottom: '30px',
              borderBottom: '1px solid #eee',
              paddingBottom: '10px',
            }}
          >
            {[
              {id: 'new', label: 'Новые'},
              {id: 'popular', label: 'Популярные'},
              {id: 'cheap', label: 'Подешевле'},
              {id: 'expensive', label: 'Подороже'},
            ].map((s) => (
              <button
                key={s.id}
                onClick={() => setSort(s.id)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: sort === s.id ? 'var(--primary-blue)' : '#888',
                  borderBottom:
                    sort === s.id ? '2px solid var(--primary-blue)' : 'none',
                  paddingBottom: '10px',
                  marginBottom: '-11px',
                }}
              >
                {s.label}
              </button>
            ))}
          </div>

          {currentProducts.length > 0 ? (
            <>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: '20px',
                }}
              >
                {currentProducts.map((p) => (
                  <div
                    key={p.id}
                    onClick={() => setModalItem(p)}
                    style={{
                      background: '#f9f9f9',
                      borderRadius: '12px',
                      padding: '20px',
                      cursor: 'pointer',
                      position: 'relative',
                      display: 'flex',
                      flexDirection: 'column',
                    }}
                  >
                    <div
                      style={{
                        position: 'absolute',
                        top: 15,
                        right: 15,
                        display: 'flex',
                        gap: '5px',
                        zIndex: 2,
                      }}
                    >
                      {p.labels?.includes('new') && (
                        <span
                          style={{
                            background: '#00d285',
                            color: '#fff',
                            padding: '4px 8px',
                            borderRadius: '4px',
                            fontSize: '11px',
                            fontWeight: 'bold',
                          }}
                        >
                          Новинка
                        </span>
                      )}
                      {p.labels?.includes('hit') && (
                        <span
                          style={{
                            background: 'var(--pink-accent)',
                            color: '#fff',
                            padding: '4px 8px',
                            borderRadius: '4px',
                            fontSize: '11px',
                            fontWeight: 'bold',
                          }}
                        >
                          Хит
                        </span>
                      )}
                    </div>

                    <img
                      src={p.image}
                      alt={p.name}
                      style={{
                        width: '100%',
                        height: '180px',
                        objectFit: 'contain',
                        marginBottom: '15px',
                      }}
                    />
                    <h3 style={{fontSize: '18px', margin: '0 0 10px 0'}}>
                      {p.price} ₽
                    </h3>
                    <p
                      style={{margin: '0 0 10px 0', fontSize: '13px', flex: 1}}
                    >
                      {p.name}
                    </p>
                    <p
                      style={{
                        margin: '0 0 15px 0',
                        fontSize: '12px',
                        color: '#f5a623',
                      }}
                    >
                      ★ {p.rating}
                    </p>

                    <div onClick={(e) => e.stopPropagation()}>
                      {!cart[p.id] ? (
                        <button
                          onClick={() => updateCart(p.id, 1)}
                          className="btn-primary"
                          style={{width: '100%'}}
                        >
                          В корзину
                        </button>
                      ) : (
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            background: 'var(--pink-accent)',
                            color: '#fff',
                            borderRadius: '6px',
                            padding: '8px 15px',
                          }}
                        >
                          <button
                            onClick={() => updateCart(p.id, -1)}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: '#fff',
                              cursor: 'pointer',
                              fontSize: '18px',
                            }}
                          >
                            -
                          </button>
                          <span style={{fontWeight: '500'}}>
                            {cart[p.id]} шт.
                          </span>
                          <button
                            onClick={() => updateCart(p.id, 1)}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: '#fff',
                              cursor: 'pointer',
                              fontSize: '18px',
                            }}
                          >
                            +
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              {renderPagination()}
            </>
          ) : (
            <p>Товары по вашему запросу не найдены</p>
          )}
        </div>

        <div
          style={{
            width: '260px',
            display: 'flex',
            flexDirection: 'column',
            gap: '25px',
          }}
        >
          <div>
            <h4 style={{margin: '0 0 10px 0'}}>Цена, ₽</h4>
            <div style={{display: 'flex', gap: '10px', marginBottom: '10px'}}>
              <input
                type="number"
                placeholder="От"
                value={filters.priceFrom}
                onChange={(e) =>
                  setFilters({...filters, priceFrom: e.target.value})
                }
                style={{
                  width: '50%',
                  padding: '10px',
                  background: 'var(--bg-gray)',
                  border: 'none',
                  borderRadius: '6px',
                }}
              />
              <input
                type="number"
                placeholder="До"
                value={filters.priceTo}
                onChange={(e) =>
                  setFilters({...filters, priceTo: e.target.value})
                }
                style={{
                  width: '50%',
                  padding: '10px',
                  background: 'var(--bg-gray)',
                  border: 'none',
                  borderRadius: '6px',
                }}
              />
            </div>
            <input
              type="range"
              min="0"
              max="100000"
              step="500"
              value={filters.priceTo || 100000}
              onChange={(e) =>
                setFilters({...filters, priceTo: e.target.value})
              }
              style={{
                width: '100%',
                accentColor: 'var(--primary-blue)',
                cursor: 'pointer',
              }}
            />
          </div>

          <div>
            <h4 style={{margin: '0 0 10px 0'}}>Тип товара</h4>
            {availableTypes.map((t) => (
              <label
                key={t.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  marginBottom: '8px',
                  fontSize: '14px',
                  cursor: 'pointer',
                }}
              >
                <input
                  type="checkbox"
                  checked={filters.types.includes(t.id)}
                  onChange={() => toggleFilter('types', t.id)}
                />
                {t.label}
              </label>
            ))}
          </div>

          <div>
            <h4 style={{margin: '0 0 10px 0'}}>Цвет</h4>
            {availableColors.map((c) => (
              <label
                key={c.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  marginBottom: '8px',
                  fontSize: '14px',
                  cursor: 'pointer',
                }}
              >
                <input
                  type="checkbox"
                  checked={filters.colors.includes(c.id)}
                  onChange={() => toggleFilter('colors', c.id)}
                />
                {c.label}
              </label>
            ))}
          </div>

          <div style={{display: 'flex', gap: '10px'}}>
            <button
              onClick={() => setAppliedFilters(filters)}
              className="btn-primary"
              style={{flex: 1}}
            >
              Показать
            </button>
            <button
              onClick={() => {
                setFilters({priceFrom: '', priceTo: '', types: [], colors: []});
                setAppliedFilters({
                  priceFrom: '',
                  priceTo: '',
                  types: [],
                  colors: [],
                });
              }}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--pink-accent)',
                cursor: 'pointer',
              }}
            >
              Сбросить
            </button>
          </div>
        </div>
      </div>

      {modalItem && (
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
          onClick={() => setModalItem(null)}
        >
          <div
            style={{
              background: '#fff',
              padding: '40px',
              borderRadius: '16px',
              width: '800px',
              display: 'flex',
              gap: '40px',
              position: 'relative',
              maxHeight: '90vh',
              overflowY: 'auto',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setModalItem(null)}
              style={{
                position: 'absolute',
                top: 20,
                right: 20,
                background: 'none',
                border: 'none',
                fontSize: '20px',
                color: '#999',
                cursor: 'pointer',
              }}
            >
              ✕
            </button>
            <div style={{position: 'relative'}}>
              <div
                style={{
                  position: 'absolute',
                  top: 10,
                  left: 10,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '5px',
                  zIndex: 2,
                }}
              >
                {modalItem.labels?.includes('new') && (
                  <span
                    style={{
                      background: '#00d285',
                      color: '#fff',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '11px',
                      fontWeight: 'bold',
                    }}
                  >
                    Новинка
                  </span>
                )}
                {modalItem.labels?.includes('hit') && (
                  <span
                    style={{
                      background: 'var(--pink-accent)',
                      color: '#fff',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '11px',
                      fontWeight: 'bold',
                    }}
                  >
                    Хит
                  </span>
                )}
              </div>
              <img
                src={modalItem.image}
                alt={modalItem.name}
                style={{
                  width: '350px',
                  height: '350px',
                  objectFit: 'contain',
                  background: 'var(--bg-gray)',
                  borderRadius: '12px',
                }}
              />
            </div>

            <div style={{flex: 1, display: 'flex', flexDirection: 'column'}}>
              <h2 style={{margin: '0 0 10px 0'}}>{modalItem.name}</h2>
              <p style={{color: '#f5a623', margin: '0 0 20px 0'}}>
                ★ {modalItem.rating}
              </p>

              <div style={{flex: 1}}>
                <h4 style={{margin: '0 0 5px 0', fontSize: '16px'}}>
                  Описание
                </h4>
                <p
                  style={{
                    fontSize: '13px',
                    color: '#555',
                    margin: '0 0 15px 0',
                    lineHeight: '1.5',
                  }}
                >
                  Надежное устройство, сочетающее в себе стильный дизайн и
                  современные технологии. Отличный выбор для повседневных задач
                  и комфортного использования.
                </p>
                <h4 style={{margin: '0 0 5px 0', fontSize: '16px'}}>
                  Характеристики
                </h4>
                <ul
                  style={{
                    fontSize: '13px',
                    color: '#555',
                    margin: '0 0 20px 0',
                    paddingLeft: '20px',
                    lineHeight: '1.6',
                  }}
                >
                  <li>
                    <strong>Гарантия:</strong> 1 год
                  </li>
                  <li>
                    <strong>Тип товара:</strong> {modalItem.type}
                  </li>
                  <li>
                    <strong>Цвет:</strong> {modalItem.color}
                  </li>
                </ul>
              </div>

              <h3
                style={{
                  fontSize: '28px',
                  margin: '0 0 20px 0',
                  textAlign: 'right',
                }}
              >
                {modalItem.price} ₽
              </h3>

              <div style={{display: 'flex', justifyContent: 'flex-end'}}>
                {!cart[modalItem.id] ? (
                  <button
                    onClick={() => updateCart(modalItem.id, 1)}
                    className="btn-primary"
                    style={{width: '200px'}}
                  >
                    В корзину
                  </button>
                ) : (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      background: 'var(--pink-accent)',
                      color: '#fff',
                      borderRadius: '6px',
                      padding: '10px 20px',
                      width: '200px',
                      justifyContent: 'space-between',
                    }}
                  >
                    <button
                      onClick={() => updateCart(modalItem.id, -1)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#fff',
                        cursor: 'pointer',
                        fontSize: '20px',
                      }}
                    >
                      -
                    </button>
                    <span style={{fontWeight: '500'}}>
                      {cart[modalItem.id]} шт.
                    </span>
                    <button
                      onClick={() => updateCart(modalItem.id, 1)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#fff',
                        cursor: 'pointer',
                        fontSize: '20px',
                      }}
                    >
                      +
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
