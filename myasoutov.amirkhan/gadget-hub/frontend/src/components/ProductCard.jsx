import { useApp } from '../context/AppContext';

export const setImageFallback = (event) => {
  const image = event.currentTarget;
  if (!image.src.endsWith('/goods/placeholder.svg')) {
    image.src = '/goods/placeholder.svg';
  }
};

export default function ProductCard({ product, withActions = false }) {
  const { setSelectedProduct, getQuantity, addToCart, changeQuantity } = useApp();
  const quantity = getQuantity(product.id);

  return (
    <div className="product-card" onClick={() => setSelectedProduct(product)}>
      <div className="card-img-wrap">
        <div className="badges">
          {product.isNew && <span className="badge badge-new">Новинка</span>}
          {product.isHit && <span className="badge badge-hit">Хит</span>}
        </div>
        <img src={product.image} alt={product.name} onError={setImageFallback} />
      </div>

      <div className="card-price">{product.price} ₽</div>
      <div className="card-title" title={product.name}>
        {product.name}
      </div>
      <div className="card-rating">⭐ {product.rating}</div>

      {withActions && (
        <div className="card-actions" onClick={(event) => event.stopPropagation()}>
          {quantity === 0 ? (
            <button type="button" className="btn-blue" onClick={() => addToCart(product.id)}>
              🛒 В корзину
            </button>
          ) : (
            <div className="card-qty-row">
              <span className="btn-pink">🛒 {quantity} шт.</span>
              <div className="qty-controls">
                <button type="button" onClick={() => changeQuantity(product.id, -1)}>
                  −
                </button>
                <span>{quantity}</span>
                <button type="button" onClick={() => changeQuantity(product.id, 1)}>
                  +
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
