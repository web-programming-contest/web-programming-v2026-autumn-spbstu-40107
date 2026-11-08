import React, {useEffect} from 'react';
import {resolveProductImage, checkIsNew, checkIsHit} from './ProductCard';

function ProductModal({
  product,
  cartItem,
  onClose,
  onAddToCart,
  onUpdateQuantity,
}) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!product) {
    return null;
  }

  const isNew = checkIsNew(product);
  const isHit = checkIsHit(product);
  const quantity = cartItem ? cartItem.quantity : 0;
  const rating =
    product.rating !== undefined
      ? String(product.rating).replace('.', ',')
      : '5';

  const getSpecs = () => {
    if (Array.isArray(product.characteristics)) {
      return product.characteristics;
    }
    if (
      product.characteristics &&
      typeof product.characteristics === 'object'
    ) {
      return Object.entries(product.characteristics).map(([name, value]) => ({
        name,
        value,
      }));
    }
    if (product.specs && typeof product.specs === 'object') {
      return Object.entries(product.specs).map(([name, value]) => ({
        name,
        value,
      }));
    }
    return [
      {name: 'Гарантия', value: product.warranty || '1 год'},
      {name: 'Тип', value: product.category || product.type || 'Гаджет'},
      {name: 'Цвет', value: product.color || 'Стандартный'},
    ];
  };

  const specs = getSpecs();

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-window product-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          className="modal-close"
          onClick={onClose}
          aria-label="Закрыть"
        >
          ✕
        </button>

        <div className="product-modal__content">
          <div className="product-modal__image-box">
            <div className="product-card__badges">
              {isNew && <span className="badge badge--new">Новинка</span>}
              {isHit && <span className="badge badge--hit">Хит</span>}
            </div>
            <img
              src={resolveProductImage(product)}
              alt={product.name || product.title}
              className="product-modal__img"
            />
          </div>

          <div className="product-modal__info">
            <h2 className="product-modal__title">
              {product.name || product.title}
            </h2>

            <div className="product-card__rating product-modal__rating">
              <span className="star-icon">★</span>
              <span>{rating}</span>
            </div>

            <p className="product-modal__description">
              {product.description ||
                `${product.name || product.title} — современное и надежное устройство, сочетающее высокое качество сборки и продуманный функционал.`}
            </p>

            <div className="product-modal__specs">
              <h3 className="product-modal__specs-title">Характеристики</h3>
              <div className="specs-list">
                {specs.map((spec, idx) => (
                  <div className="specs-row" key={idx}>
                    <span className="specs-name">
                      {spec.name || spec.label}
                    </span>
                    <span className="specs-dots" />
                    <span className="specs-val">{spec.value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="product-modal__footer">
              <div className="product-modal__price">
                {Number(product.price).toLocaleString('ru-RU')} ₽
              </div>

              <div className="product-modal__actions">
                {quantity === 0 ? (
                  <button
                    type="button"
                    className="btn btn--blue"
                    onClick={() => onAddToCart(product)}
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <circle cx="9" cy="21" r="1" />
                      <circle cx="20" cy="21" r="1" />
                      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                    </svg>
                    <span>В корзину</span>
                  </button>
                ) : (
                  <div className="product-modal__in-cart">
                    <div className="qty-controls">
                      <button
                        type="button"
                        className="qty-btn"
                        onClick={() => onUpdateQuantity(product.id, -1)}
                      >
                        −
                      </button>
                      <span className="qty-value">{quantity}</span>
                      <button
                        type="button"
                        className="qty-btn"
                        onClick={() => onUpdateQuantity(product.id, 1)}
                      >
                        +
                      </button>
                    </div>
                    <button type="button" className="btn btn--pink">
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <circle cx="9" cy="21" r="1" />
                        <circle cx="20" cy="21" r="1" />
                        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                      </svg>
                      <span>В корзине {quantity} шт.</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductModal;
