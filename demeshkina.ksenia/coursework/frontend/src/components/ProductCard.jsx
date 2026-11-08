export function resolveProductImage(product) {
  if (!product || !product.image) {
    return '';
  }

  const fileName = product.image.replace('/', '');

  return `/images/goods/${fileName}`;
}

export function checkIsNew(product) {
  if (product.isNew !== undefined) {
    return Boolean(product.isNew);
  }
  if (product.new !== undefined) {
    return Boolean(product.new);
  }
  if (Array.isArray(product.labels)) {
    return product.labels.includes('new') || product.labels.includes('Новинка');
  }
  if (product.label) {
    return product.label === 'new' || product.label === 'Новинка';
  }
  return false;
}

export function checkIsHit(product) {
  if (product.isHit !== undefined) {
    return Boolean(product.isHit);
  }
  if (product.hit !== undefined) {
    return Boolean(product.hit);
  }
  if (Array.isArray(product.labels)) {
    return product.labels.includes('hit') || product.labels.includes('Хит');
  }
  if (product.label) {
    return product.label === 'hit' || product.label === 'Хит';
  }
  return false;
}

function ProductCard({
  product,
  cartItem,
  onAddToCart,
  onUpdateQuantity,
  onOpenModal,
  showCartControls = true,
}) {
  const isNew = checkIsNew(product);
  const isHit = checkIsHit(product);
  const quantity = cartItem ? cartItem.quantity : 0;
  const rating =
    product.rating !== undefined
      ? String(product.rating).replace('.', ',')
      : '5';

  const handleCardClick = () => {
    if (onOpenModal) {
      onOpenModal(product);
    }
  };

  const handleAddClick = (e) => {
    e.stopPropagation();
    onAddToCart(product);
  };

  const handleMinusClick = (e) => {
    e.stopPropagation();
    onUpdateQuantity(product.id, -1);
  };

  const handlePlusClick = (e) => {
    e.stopPropagation();
    onUpdateQuantity(product.id, 1);
  };

  return (
    <div className="product-card" onClick={handleCardClick}>
      <div className="product-card__image-box">
        <div className="product-card__badges">
          {isNew && <span className="badge badge--new">Новинка</span>}
          {isHit && <span className="badge badge--hit">Хит</span>}
        </div>
        <img
          src={resolveProductImage(product)}
          alt={product.name || product.title}
          className="product-card__img"
        />
      </div>

      <div className="product-card__body">
        <div className="product-card__price">
          {Number(product.price).toLocaleString('ru-RU')} ₽
        </div>
        <div
          className="product-card__title"
          title={product.name || product.title}
        >
          {product.name || product.title}
        </div>
        <div className="product-card__rating">
          <span className="star-icon">★</span>
          <span>{rating}</span>
        </div>

        {showCartControls && (
          <div
            className="product-card__actions"
            onClick={(e) => e.stopPropagation()}
          >
            {quantity === 0 ? (
              <button
                type="button"
                className="btn btn--blue product-card__btn"
                onClick={handleAddClick}
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
              <div className="product-card__in-cart-row">
                <button
                  type="button"
                  className="btn btn--pink product-card__pink-badge"
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
                  <span>{quantity} шт.</span>
                </button>
                <div className="qty-controls">
                  <button
                    type="button"
                    className="qty-btn"
                    onClick={handleMinusClick}
                  >
                    −
                  </button>
                  <span className="qty-value">{quantity}</span>
                  <button
                    type="button"
                    className="qty-btn"
                    onClick={handlePlusClick}
                  >
                    +
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default ProductCard;
