import {useCart} from '../context/CartContext.jsx';
import {useAuth} from '../context/AuthContext.jsx';
import {Link} from 'react-router-dom';
import {formatPrice} from '../catalog.js';
import Icon from './Icon.jsx';

export function ProductLabels({product}) {
  return (
    <span className="product-labels">
      {product.isNew && <span className="label label-new">Новинка</span>}
      {product.isHit && <span className="label label-hit">Хит</span>}
    </span>
  );
}

export function Rating({value}) {
  return <span className="rating" aria-label={`Рейтинг ${value} из 5`}><span aria-hidden="true">★</span> {String(value).replace('.', ',')}</span>;
}

export function CartControl({product}) {
  const {getQuantity, addItem, setQuantity} = useCart();
  const {user} = useAuth();
  const quantity = getQuantity(product.id);
  if (!user) return <Link className="button add-button" to="/login"><Icon name="cart" />Войти для покупки</Link>;
  if (!quantity) {
    return (
      <button className="button add-button" onClick={() => addItem(product.id)} aria-label={`Добавить в корзину: ${product.name}`}>
        <Icon name="cart" />В корзину
      </button>
    );
  }
  return (
    <div className="cart-control">
      <span className="in-cart"><Icon name="cart" />{quantity} шт.</span>
      <div className="quantity-control" aria-label={`Количество: ${product.name}`}>
        <button onClick={() => setQuantity(product.id, quantity - 1)} aria-label={`Уменьшить количество: ${product.name}`}>−</button>
        <output aria-live="polite">{quantity}</output>
        <button onClick={() => addItem(product.id)} aria-label={`Увеличить количество: ${product.name}`}>+</button>
      </div>
    </div>
  );
}

export default function ProductCard({product, onOpen, compact = false}) {
  return (
    <article className={`product-card ${compact ? 'product-card-compact' : ''}`}>
      <button className="product-open" onClick={() => onOpen(product)} aria-label={`Подробнее: ${product.name}`}>
        <span className="product-image">
          <img src={product.image} alt={product.name} loading="lazy" />
          <ProductLabels product={product} />
        </span>
        <strong className="product-price">{formatPrice(product.price)}</strong>
        <span className="product-name" title={product.name}>{product.name}</span>
        <Rating value={product.rating} />
      </button>
      {!compact && <CartControl product={product} />}
    </article>
  );
}
