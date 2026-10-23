import { formatPrice } from '../utils/format.js'
import CartControl from './CartControl.jsx'
import Label from './Label.jsx'
import Modal from './Modal.jsx'
import Rating from './Rating.jsx'
import './ProductModal.css'

function ProductModal({ product, onClose }) {
  return (
    <Modal onClose={onClose} className="product-modal">
      <div className="product-modal__image">
        <img src={product.image} alt={product.name} />
      </div>

      <div className="product-modal__info">
        {(product.isNew || product.isHit) && (
          <div className="product-modal__labels">
            {product.isNew && <Label type="new" />}
            {product.isHit && <Label type="hit" />}
          </div>
        )}
        <h2 className="title product-modal__title">{product.name}</h2>
        <Rating value={product.rating} />
        <p className="product-modal__description">{product.description}</p>

        <h3 className="product-modal__subtitle">Характеристики</h3>
        <dl className="product-modal__specs">
          {Object.entries(product.specs).map(([key, value]) => (
            <div key={key} className="product-modal__spec">
              <dt>{key}</dt>
              <dd>{value}</dd>
            </div>
          ))}
        </dl>

        <div className="product-modal__bottom">
          <p className="product-modal__price">{formatPrice(product.price)}</p>
          <CartControl product={product} full />
        </div>
      </div>
    </Modal>
  )
}

export default ProductModal
