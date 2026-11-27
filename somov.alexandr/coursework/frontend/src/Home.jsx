import {useState} from 'react';
import ProductCard from './components/ProductCard.jsx';
import Icon from './components/Icon.jsx';

function Carousel({title, text, icon, products, onOpen}) {
  const [start, setStart] = useState(0);
  if (!products.length) return null;
  const visible = Array.from({length: Math.min(3, products.length)}, (_, index) => products[(start + index) % products.length]);
  const move = (step) => setStart((start + step + products.length) % products.length);
  return (
    <section className="carousel" aria-label={title}>
      <div className="carousel-intro"><Icon className={`section-icon ${icon}`} name={icon} /><h2>{title}</h2><p>{text}</p></div>
      <button className="arrow-button arrow-left" onClick={() => move(-1)} aria-label={`${title}: предыдущие товары`} disabled={products.length <= 3}><Icon name="arrow" /></button>
      <div className="carousel-products">{visible.map((product) => <ProductCard key={product.id} product={product} onOpen={onOpen} compact />)}</div>
      <button className="arrow-button" onClick={() => move(1)} aria-label={`${title}: следующие товары`} disabled={products.length <= 3}><Icon name="arrow" /></button>
    </section>
  );
}

export default function Home({goods, onOpen}) {
  const hits = goods.filter((product) => product.isHit).sort((a, b) => b.popularity - a.popularity);
  const news = goods.filter((product) => product.isNew).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const promotionalProduct = goods.find((product) => product.id === 34);
  return (
    <div className="container home-page">
      <h1 className="visually-hidden">Gadget Hub — магазин гаджетов</h1>
      <button className="hero" onClick={() => onOpen(promotionalProduct)} disabled={!promotionalProduct} aria-label="Умный робот-друг Red solution Reddy Air — подробнее об акции">
        <img src="/assets/images/banner.png" alt="Суперраспродажа: умный робот-друг Red solution Reddy Air за 27 990 рублей, скидка 10%" fetchPriority="high" />
      </button>
      <Carousel title="Хиты продаж" text="Тысячи покупателей уже одобрили эти товары. Самые популярные, проверенные и надёжные гаджеты!" icon="flame" products={hits} onOpen={onOpen} />
      <Carousel title="Новинки" text="Их только произвели — они уже у нас! Всё самое новое и свежее на рынке электроники." icon="sparkles" products={news} onOpen={onOpen} />
      <section className="benefits"><h2>Преимущества</h2><div className="benefit-grid">
        <div className="benefit"><Icon name="rocket" /><h3>Утром заказали,<br />вечером получили</h3></div>
        <div className="benefit"><Icon name="refund" /><h3>С товаром что-то не так?<br />Вернём деньги</h3></div>
        <div className="benefit"><Icon name="certificate" /><h3>Только оригинальные<br />товары</h3></div>
      </div></section>
      <section className="contacts"><h2>Работаем 24/7</h2><div className="contact-grid">
        <a href="tel:88006783424"><Icon name="phone" />8 (800) 678-34-24</a>
        <a href="mailto:gadget@hub.ru"><Icon name="mail" />gadget@hub.ru</a>
        <p><Icon name="pin" /><span>Санкт-Петербург, ул.<br />Барочная, д. 7, корпус 2</span></p>
      </div></section>
    </div>
  );
}
