import ProductCard, { setImageFallback } from '../components/ProductCard';
import { useApp } from '../context/AppContext';

function Carousel({ title, description, icon, items, index, setIndex }) {
  const { getCarouselSlice } = useApp();
  const visible = getCarouselSlice(items, index);

  const move = (delta) => {
    if (items.length === 0) return;
    setIndex((prev) => (prev + delta + items.length) % items.length);
  };

  return (
    <section className="carousel-section">
      <div className="carousel-info">
        <div className="section-icon">{icon}</div>
        <h2>{title}</h2>
        <p>{description}</p>
      </div>

      <div className="carousel-wrap">
        <button type="button" className="carousel-arrow" onClick={() => move(-1)}>
          ‹
        </button>
        <div className="carousel-cards">
          {visible.map((item) => (
            <ProductCard key={item.id} product={item} />
          ))}
        </div>
        <button type="button" className="carousel-arrow" onClick={() => move(1)}>
          ›
        </button>
      </div>
    </section>
  );
}

export default function Home() {
  const {
    heroProduct,
    hitGoods,
    newGoods,
    hitIndex,
    setHitIndex,
    newIndex,
    setNewIndex,
    setSelectedProduct
  } = useApp();

  const oldPrice = heroProduct
    ? Math.round(heroProduct.price / 0.9 / 10) * 10
    : null;

  const openHeroProduct = () => {
    if (heroProduct) setSelectedProduct(heroProduct);
  };

  return (
    <div className="container">
      <section
        className="hero-banner"
        role="button"
        tabIndex={0}
        aria-label={heroProduct ? `Подробнее: ${heroProduct.name}` : 'Подробнее о товаре'}
        onClick={openHeroProduct}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            openHeroProduct();
          }
        }}
      >
        <div className="hero-text">
          <div className="hero-sale">SUPER SALE</div>
          <div className="hero-discount">
            <span className="discount-percent">-10%</span>
            <span className="discount-price">{heroProduct?.price ?? 0} ₽</span>
            <span className="discount-old">{oldPrice ?? 0} ₽</span>
          </div>
          <p className="hero-subtitle">{heroProduct?.name ?? 'Гаджеты для каждого дня'}</p>
        </div>
        <div className="hero-img-box">
          <img
            src={heroProduct?.image || '/goods/placeholder.svg'}
            alt={heroProduct?.name || 'Товар'}
            onError={setImageFallback}
          />
        </div>
      </section>

      <Carousel
        title="Хиты продаж"
        description="Тысячи покупателей уже одобрили эти товары. Самые популярные, проверенные и надежные гаджеты!"
        icon="🔥"
        items={hitGoods}
        index={hitIndex}
        setIndex={setHitIndex}
      />

      <Carousel
        title="Новинки"
        description="Их только произвели — они уже у нас! Все самое новое и свежее на рынке электроники"
        icon="✨"
        items={newGoods}
        index={newIndex}
        setIndex={setNewIndex}
      />

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

      <section className="contacts-section">
        <div className="contacts-card">
          <h3>Работаем 24/7</h3>
          <p>
            <img src="/icons/mobile.svg" alt="" className="contact-icon" />
            8 (800) 678-34-24
          </p>
          <p>✉️ gadget@hub.ru</p>
          <p>📍 Санкт-Петербург, ул. Барочная, д.7, корпус 2</p>
        </div>
      </section>
    </div>
  );
}
