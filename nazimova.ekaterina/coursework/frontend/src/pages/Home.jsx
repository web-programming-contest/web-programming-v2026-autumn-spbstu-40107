import React, {useState} from 'react';
import ProductCard, {checkIsHit, checkIsNew} from '../components/ProductCard';
import heroBanner from '../assets/hero.png';

function CarouselSection({title, description, icon, items, onOpenModal}) {
  const [startIndex, setStartIndex] = useState(0);
  const visibleCount = 3;

  const handlePrev = () => {
    if (items.length === 0) {
      return;
    }
    setStartIndex((prev) => (prev - 1 + items.length) % items.length);
  };

  const handleNext = () => {
    if (items.length === 0) {
      return;
    }
    setStartIndex((prev) => (prev + 1) % items.length);
  };

  const visibleItems = [];
  if (items.length > 0) {
    const count = Math.min(visibleCount, items.length);
    for (let i = 0; i < count; i++) {
      visibleItems.push(items[(startIndex + i) % items.length]);
    }
  }

  return (
    <section className="home-carousel-section">
      <div className="carousel-info">
        <div className="carousel-icon">{icon}</div>
        <h2 className="carousel-title">{title}</h2>
        <p className="carousel-desc">{description}</p>
      </div>

      <div className="carousel-wrapper">
        <button
          type="button"
          className="carousel-arrow carousel-arrow--left"
          onClick={handlePrev}
        >
          ‹
        </button>
        <div className="carousel-track">
          {visibleItems.map((item, idx) => (
            <ProductCard
              key={`${item.id}-${idx}`}
              product={item}
              onOpenModal={onOpenModal}
              showCartControls={false}
            />
          ))}
        </div>
        <button
          type="button"
          className="carousel-arrow carousel-arrow--right"
          onClick={handleNext}
        >
          ›
        </button>
      </div>
    </section>
  );
}

function Home({goods, onOpenModal}) {
  const hits = goods.filter((g) => checkIsHit(g));
  const newItems = goods.filter((g) => checkIsNew(g));

  return (
    <div className="home-page container">
      <section className="hero-section">
        <img src={heroBanner} alt="Super Sale" className="hero-banner-img" />
      </section>

      <CarouselSection
        title="Хиты продаж"
        description="Тысячи покупателей уже одобрили эти товары. Самые популярные, проверенные и надежные гаджеты!"
        icon={<span className="icon-badge icon-badge--pink">🔥</span>}
        items={hits.length > 0 ? hits : goods.slice(0, 6)}
        onOpenModal={onOpenModal}
      />

      <CarouselSection
        title="Новинки"
        description="Их только произвели — они уже у нас! Все самое новое и свежее на рынке электроники"
        icon={<span className="icon-badge icon-badge--green">✨</span>}
        items={newItems.length > 0 ? newItems : goods.slice(0, 6)}
        onOpenModal={onOpenModal}
      />

      <section className="benefits-section">
        <h2 className="section-heading">Преимущества</h2>
        <div className="benefits-grid">
          <div className="benefit-card">
            <div className="benefit-icon benefit-icon--pink">🚀</div>
            <p className="benefit-text">
              Утром заказали,
              <br />
              вечером получили
            </p>
          </div>
          <div className="benefit-card">
            <div className="benefit-icon benefit-icon--blue">₽</div>
            <p className="benefit-text">
              С товаром что-то не так?
              <br />
              Вернем деньги
            </p>
          </div>
          <div className="benefit-card">
            <div className="benefit-icon benefit-icon--green">✓</div>
            <p className="benefit-text">
              Только оригинальные
              <br />
              товары
            </p>
          </div>
          <div className="benefit-card">
            <div className="benefit-icon benefit-icon--yellow">24/7</div>
            <p className="benefit-text">Работаем 24/7</p>
          </div>
        </div>
      </section>

      <section className="contacts-section">
        <h2 className="section-heading">Контакты</h2>
        <div className="contacts-card">
          <div className="contacts-item">
            📞 <span>8 (800) 678-34-24</span>
          </div>
          <div className="contacts-item">
            ✉️ <span>gadget@hub.ru</span>
          </div>
          <div className="contacts-item">
            📍 <span>Санкт-Петербург, ул. Барочная, д.7, корпус 2</span>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;
