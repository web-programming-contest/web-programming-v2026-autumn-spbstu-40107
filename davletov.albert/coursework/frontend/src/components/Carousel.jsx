import { useState } from 'react'
import ProductCard from './ProductCard.jsx'
import './Carousel.css'

const VISIBLE = 3

function Carousel({ icon, title, description, products, onOpen }) {
  const [start, setStart] = useState(0)
  const count = products.length

  const visible = Array.from(
    { length: Math.min(VISIBLE, count) },
    (_, i) => products[(start + i) % count],
  )

  const showPrev = () => setStart((start - 1 + count) % count)
  const showNext = () => setStart((start + 1) % count)

  return (
    <section className="carousel">
      <div className="carousel__about">
        <img src={icon} alt="" className="carousel__icon" />
        <h2 className="title">{title}</h2>
        <p className="carousel__description">{description}</p>
      </div>

      <button type="button" className="carousel__arrow" onClick={showPrev} aria-label="Назад" />

      <div className="carousel__list">
        {visible.map((product) => (
          <ProductCard key={product.id} product={product} onOpen={onOpen} withCart={false} />
        ))}
      </div>

      <button
        type="button"
        className="carousel__arrow carousel__arrow--next"
        onClick={showNext}
        aria-label="Вперёд"
      />
    </section>
  )
}

export default Carousel
