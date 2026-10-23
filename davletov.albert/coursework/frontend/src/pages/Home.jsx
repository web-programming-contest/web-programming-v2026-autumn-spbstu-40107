import { useState } from 'react'
import { useGoods } from '../hooks/useGoods.js'
import Carousel from '../components/Carousel.jsx'
import ProductModal from '../components/ProductModal.jsx'
import './Home.css'

const ADVANTAGES = [
  { icon: '/images/icons/rocket.png', text: 'Утром заказали, вечером получили' },
  { icon: '/images/icons/refund.png', text: 'С товаром что-то не так? Вернем деньги' },
  { icon: '/images/icons/original.png', text: 'Только оригинальные товары' },
]

const CONTACTS = [
  { icon: '/images/icons/phone.png', text: '8 (800) 678-34-24', href: 'tel:88006783424' },
  { icon: '/images/icons/mail.png', text: 'gadget@hub.ru', href: 'mailto:gadget@hub.ru' },
  { icon: '/images/icons/pin.png', text: 'Санкт-Петербург, ул. Барочная, д.7, корпус 2' },
]

function Home() {
  const { goods, error } = useGoods()
  const [openedProduct, setOpenedProduct] = useState(null)

  const hits = goods.filter((product) => product.isHit)
  const news = goods.filter((product) => product.isNew)

  return (
    <div className="container home">
      <img src="/images/illustrations/banner.png" alt="Super Sale" className="home__banner" />

      {error && <p className="home__error">{error}</p>}

      {hits.length > 0 && (
        <Carousel
          icon="/images/icons/fire.png"
          title="Хиты продаж"
          description="Тысячи покупателей уже одобрили эти товары. Самые популярные, проверенные и надежные гаджеты!"
          products={hits}
          onOpen={setOpenedProduct}
        />
      )}

      {news.length > 0 && (
        <Carousel
          icon="/images/icons/sparkles.png"
          title="Новинки"
          description="Их только произвели - они уже у нас! Все самое новое и свежее на рынке электроники"
          products={news}
          onOpen={setOpenedProduct}
        />
      )}

      <section>
        <h2 className="subtitle">Преимущества</h2>
        <ul className="home__advantages">
          {ADVANTAGES.map((advantage) => (
            <li key={advantage.text} className="home__advantage">
              <img src={advantage.icon} alt="" width="72" height="72" />
              <p className="subtitle">{advantage.text}</p>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="title">Работаем 24/7</h2>
        <ul className="home__contacts">
          {CONTACTS.map((contact) => (
            <li key={contact.text} className="home__contact">
              <img src={contact.icon} alt="" width="40" height="40" />
              {contact.href ? <a href={contact.href}>{contact.text}</a> : <span>{contact.text}</span>}
            </li>
          ))}
        </ul>
      </section>

      {openedProduct && (
        <ProductModal product={openedProduct} onClose={() => setOpenedProduct(null)} />
      )}
    </div>
  )
}

export default Home
