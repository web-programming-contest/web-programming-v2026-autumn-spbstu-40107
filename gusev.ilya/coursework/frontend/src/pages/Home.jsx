import {useState} from 'react';
import {Link} from 'react-router-dom';
import {useApp} from '../ctx.js';
import {Card, Icon, ProductModal} from '../ui.jsx';
function Carousel({title, description, items, icon, onOpen}) {
  const [index, setIndex] = useState(0);
  if (!items.length) {
    return null;
  }
  const count = Math.min(3, items.length);
  const shown = Array.from(
    {length: count},
    (_, i) => items[(index + i) % items.length],
  );
  return (
    <section
      className="carousel-section"
      aria-label={title}
      aria-roledescription="карусель"
    >
      <div className="carousel-intro">
        <img
          src={
            icon === 'sparkles' ? '/images/sparkles.svg' : '/images/flame.svg'
          }
          alt=""
        />
        <h2>{title}</h2>
        <p>{description}</p>
      </div>
      <div className="carousel">
        <button
          className="carousel-arrow prev"
          aria-label={`${title}: назад`}
          onClick={() =>
            setIndex((current) => (current - 1 + items.length) % items.length)
          }
        >
          <Icon name="chevron" />
        </button>
        <div className="slides">
          {shown.map((g) => (
            <Card key={g.id} g={g} onOpen={onOpen} showCart={false} />
          ))}
        </div>
        <button
          className="carousel-arrow next"
          aria-label={`${title}: вперёд`}
          onClick={() => setIndex((current) => (current + 1) % items.length)}
        >
          <Icon name="chevron" />
        </button>
      </div>
    </section>
  );
}
export default function Home() {
  const {goods} = useApp();
  const [open, setOpen] = useState(null);
  return (
    <>
      <section className="hero" aria-label="Предложение недели">
        <div className="hero-copy">
          <p className="hero-kicker">Технологии, которые удивляют</p>
          <h1>
            Умный
            <br />
            робот-друг
          </h1>
          <p className="hero-model">Red solution Reddy Air</p>
          <div className="hero-prices">
            <strong>27 990 ₽</strong>
            <del>31 100 ₽</del>
            <span>−10%</span>
          </div>
          <Link to="/catalog" className="btn pink">
            Перейти в каталог
          </Link>
        </div>
        <img
          className="hero-robot"
          src="/images/product-01.webp"
          alt="Умный робот-друг Red solution Reddy Air"
          fetchpriority="high"
        />
      </section>
      <Carousel
        title="Хиты продаж"
        description="Тысячи покупателей уже одобрили эти товары. Самые популярные, проверенные и надежные гаджеты!"
        items={goods
          .filter((g) => g.isHit)
          .sort(
            (a, b) =>
              ([9, 8, 33].includes(a.id)
                ? [9, 8, 33].indexOf(a.id)
                : 10 + a.id) -
              ([9, 8, 33].includes(b.id)
                ? [9, 8, 33].indexOf(b.id)
                : 10 + b.id),
          )}
        onOpen={setOpen}
      />
      <Carousel
        title="Новинки"
        description="Их только произвели — они уже у нас! Все самое новое и свежее на рынке электроники."
        items={goods.filter((g) => g.isNew)}
        icon="sparkles"
        onOpen={setOpen}
      />
      <section className="advantages">
        <h2>Преимущества</h2>
        <div className="adv-grid">
          {[
            ['rocket', 'Утром заказали, вечером получили'],
            ['refund', 'С товаром что-то не так? Вернем деньги'],
            ['original', 'Только оригинальные товары'],
          ].map(([icon, text]) => (
            <div className="adv-item" key={icon}>
              <img src={`/images/${icon}.svg`} alt="" />
              <h3>{text}</h3>
            </div>
          ))}
        </div>
      </section>
      <section className="contacts">
        <h2>Работаем 24/7</h2>
        <div className="contact-grid">
          <a href="tel:88006783424">
            <img src="/images/phone.svg" alt="" />8 (800) 678-34-24
          </a>
          <a href="mailto:gadget@hub.ru">
            <img src="/images/email.svg" alt="" />
            gadget@hub.ru
          </a>
          <p>
            <img src="/images/pin.svg" alt="" />
            <span>
              Санкт-Петербург,
              <br />
              ул. Барочная, д. 7, корпус 2
            </span>
          </p>
        </div>
      </section>
      {open && <ProductModal g={open} onClose={() => setOpen(null)} />}
    </>
  );
}
