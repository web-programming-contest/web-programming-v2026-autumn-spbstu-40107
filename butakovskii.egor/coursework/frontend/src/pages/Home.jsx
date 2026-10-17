import {useState, useEffect} from 'react';

const Carousel = ({title, items, icon}) => {
  const [index, setIndex] = useState(0);
  if (!items || items.length === 0) return null;

  const next = () => setIndex((prev) => (prev + 1) % items.length);
  const prev = () =>
    setIndex((prev) => (prev - 1 + items.length) % items.length);

  const visibleItems = [
    items[index],
    items[(index + 1) % items.length],
    items[(index + 2) % items.length],
  ].filter(Boolean);

  return (
    <div
      style={{
        display: 'flex',
        gap: '30px',
        marginBottom: '80px',
        alignItems: 'center',
      }}
    >
      <div style={{width: '250px'}}>
        <h2
          style={{
            fontSize: '24px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            margin: '0 0 15px 0',
          }}
        >
          {icon} {title}
        </h2>
        <p
          style={{
            color: '#666',
            fontSize: '14px',
            lineHeight: '1.5',
            margin: 0,
          }}
        >
          {title === 'Хиты продаж'
            ? 'Тысячи покупателей уже одобрили эти товары. Самые популярные, проверенные и надежные гаджеты!'
            : 'Их только произвели - они уже у нас! Все самое новое и свежее на рынке электроники'}
        </p>
      </div>

      <button
        onClick={prev}
        style={{
          background: 'none',
          border: 'none',
          color: 'var(--primary-blue)',
          fontSize: '28px',
          cursor: 'pointer',
          padding: '10px',
        }}
      >
        ❮
      </button>

      <div
        style={{
          display: 'flex',
          gap: '20px',
          flex: 1,
          justifyContent: 'space-between',
        }}
      >
        {visibleItems.map((p) => (
          <div
            key={p.id}
            style={{
              background: '#f9f9f9',
              borderRadius: '12px',
              padding: '20px',
              width: '31%',
              position: 'relative',
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
                height: '150px',
                objectFit: 'contain',
                marginBottom: '15px',
              }}
            />
            <h3 style={{fontSize: '18px', margin: '0 0 10px 0'}}>
              {p.price} ₽
            </h3>
            <p
              style={{
                margin: '0 0 10px 0',
                fontSize: '12px',
                color: '#333',
                height: '35px',
                overflow: 'hidden',
              }}
            >
              {p.name}
            </p>
            <p style={{margin: 0, fontSize: '12px', color: '#f5a623'}}>
              ★ {p.rating}
            </p>
          </div>
        ))}
      </div>

      <button
        onClick={next}
        style={{
          background: 'none',
          border: 'none',
          color: 'var(--primary-blue)',
          fontSize: '28px',
          cursor: 'pointer',
          padding: '10px',
        }}
      >
        ❯
      </button>
    </div>
  );
};

export default function Home() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    fetch('/api/goods')
      .then((r) => r.json())
      .then(setProducts);
  }, []);

  const hits = products.filter((p) => p.labels?.includes('hit'));
  const news = products.filter((p) => p.labels?.includes('new'));

  return (
    <div className="container" style={{marginTop: '30px'}}>
      <div
        style={{
          background: 'linear-gradient(90deg, #0c20d6 0%, #ff1c83 100%)',
          borderRadius: '16px',
          height: '350px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff',
          marginBottom: '80px',
        }}
      >
        <h1 style={{fontSize: '48px', fontStyle: 'italic'}}>SUPER SALE -10%</h1>
      </div>

      <Carousel title="Хиты продаж" items={hits} icon="🔥" />
      <Carousel title="Новинки" items={news} icon="✨" />

      <h2 style={{fontSize: '24px', marginBottom: '30px'}}>Преимущества</h2>
      <div style={{display: 'flex', gap: '30px', marginBottom: '80px'}}>
        <div
          style={{
            flex: 1,
            background: '#f9f9f9',
            padding: '40px 30px',
            borderRadius: '16px',
          }}
        >
          <div
            style={{
              fontSize: '32px',
              marginBottom: '15px',
              color: 'var(--pink-accent)',
            }}
          >
            🚀
          </div>
          <h4 style={{margin: '0 0 10px 0', fontSize: '16px'}}>
            Утром заказали,
            <br />
            вечером получили
          </h4>
        </div>
        <div
          style={{
            flex: 1,
            background: '#f9f9f9',
            padding: '40px 30px',
            borderRadius: '16px',
          }}
        >
          <div
            style={{
              fontSize: '32px',
              marginBottom: '15px',
              color: 'var(--primary-blue)',
            }}
          >
            🔄
          </div>
          <h4 style={{margin: '0 0 10px 0', fontSize: '16px'}}>
            С товаром что-то не так?
            <br />
            Вернем деньги
          </h4>
        </div>
        <div
          style={{
            flex: 1,
            background: '#f9f9f9',
            padding: '40px 30px',
            borderRadius: '16px',
          }}
        >
          <div
            style={{fontSize: '32px', marginBottom: '15px', color: '#00d285'}}
          >
            ✅
          </div>
          <h4 style={{margin: '0 0 10px 0', fontSize: '16px'}}>
            Только оригинальные
            <br />
            товары
          </h4>
        </div>
      </div>

      <h2 style={{fontSize: '24px', marginBottom: '30px'}}>Работаем 24/7</h2>
      <div
        style={{
          display: 'flex',
          gap: '60px',
          alignItems: 'center',
          marginBottom: '60px',
          fontWeight: 'bold',
        }}
      >
        <div style={{display: 'flex', alignItems: 'center', gap: '15px'}}>
          <img
            src="/mobile.svg"
            alt=""
            width="20"
            style={{filter: 'invert(0)'}}
          />
          8 (800) 678-34-24
        </div>
        <div style={{display: 'flex', alignItems: 'center', gap: '15px'}}>
          ✉ gadget@hub.ru
        </div>
        <div style={{display: 'flex', alignItems: 'center', gap: '15px'}}>
          📍 Санкт-Петербург, ул. Барочная, д.7, корпус 2
        </div>
      </div>
    </div>
  );
}
