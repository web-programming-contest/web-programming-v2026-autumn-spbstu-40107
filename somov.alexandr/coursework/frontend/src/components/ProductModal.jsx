import {useEffect, useRef} from 'react';
import {formatPrice} from '../catalog.js';
import {CartControl, ProductLabels, Rating} from './ProductCard.jsx';
import Icon from './Icon.jsx';

export default function ProductModal({product, onClose}) {
  const dialog = useRef(null);
  useEffect(() => {
    dialog.current.showModal();
  }, []);

  function closeOnBackdrop(event) {
    if (event.target === event.currentTarget) dialog.current.close();
  }

  return (
    <dialog ref={dialog} className="product-modal" onClose={onClose} aria-labelledby="product-title" onClick={closeOnBackdrop}>
      <div className="product-modal-inner">
        <button className="close-button" aria-label="Закрыть карточку товара" onClick={() => dialog.current.close()}>
          <Icon name="close" />
        </button>
        <div className="modal-image">
          <img src={product.image} alt={product.name} />
          <ProductLabels product={product} />
        </div>
        <div className="modal-details">
          <h2 id="product-title">{product.name}</h2>
          <Rating value={product.rating} />
          <p className="product-description">{product.description}</p>
          <h3>Характеристики</h3>
          <dl className="specifications">
            {product.specifications.map((spec) => (
              <div key={spec.name}><dt>{spec.name}</dt><dd>{spec.value}</dd></div>
            ))}
          </dl>
          <div className="modal-purchase">
            <strong className="product-price">{formatPrice(product.price)}</strong>
            <CartControl product={product} />
          </div>
        </div>
      </div>
    </dialog>
  );
}
