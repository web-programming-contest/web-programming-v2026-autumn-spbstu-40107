import { formatPrice } from '../utils/format.js'
import CartControl from './CartControl.jsx'
import Label from './Label.jsx'
import Rating from './Rating.jsx'
import './ProductCard.css'

function ProductCard({ product, onOpen, withCart = true }) {
  return (
    <article className="product-card" onClick={() => onOpen(product)}>
      <div className="product-card__image">
        <img src={product.image} alt={product.name} />
        <div className="product-card__labels">
          {product.isNew && <Label type="new" />}
          {product.isHit && <Label type="hit" />}
        </div>
      </div>
      <p className="product-card__price">{formatPrice(product.price)}</p>
      <h3 className="product-card__name" title={product.name}>
        {product.name}
      </h3>
      <Rating value={product.rating} />
      {withCart && (
        <div className="product-card__cart" onClick={(event) => event.stopPropagation()}>
          <CartControl product={product} />
        </div>
      )}
    </article>
  )
}

export default ProductCard
