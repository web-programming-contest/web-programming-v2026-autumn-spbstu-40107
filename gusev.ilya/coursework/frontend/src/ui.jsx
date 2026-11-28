import {useEffect, useId, useRef} from 'react';
import {useNavigate} from 'react-router-dom';
import {useApp} from './ctx.js';
export const fmt = (value) => `${Number(value).toLocaleString('ru-RU')} ₽`;
export const TYPES = {
  smartphone: 'Смартфоны',
  watch: 'Умные часы',
  vr: 'Очки виртуальной реальности',
  speaker: 'Портативная акустика',
  transport: 'Электротранспорт',
  fitness: 'Фитнес-браслеты',
  headphones: 'Наушники',
  robot: 'Роботы',
  powerbank: 'Внешние аккумуляторы',
  accessory: 'Аксессуары',
  security: 'Ключи и кошельки',
  camera: 'Видеокамеры',
  microphone: 'Микрофоны',
  'smart-home': 'Умный дом',
  health: 'Гаджеты для здоровья',
};
export const COLORS = {
  white: 'Белый',
  black: 'Чёрный',
  pink: 'Розовый',
  purple: 'Фиолетовый',
  cyan: 'Голубой',
  blue: 'Синий',
  gray: 'Серый',
  green: 'Зелёный',
  red: 'Красный',
  yellow: 'Жёлтый',
  beige: 'Бежевый',
};
export function BrandMark({monochrome = false}) {
  return (
    <svg
      className="brand-mark"
      viewBox="0 0 148 36"
      role="img"
      aria-label="Gadget Hub"
    >
      <text x="0" y="26" fontSize="24" fontWeight="500" fill="currentColor">
        Gadget{' '}
        <tspan fill={monochrome ? 'currentColor' : 'var(--pink)'}>Hub</tspan>
      </text>
    </svg>
  );
}
export function Icon({name, ...props}) {
  const paths = {
    grid: (
      <>
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </>
    ),
    cart: (
      <>
        <path d="M2 3h3l3 12h11l3-9H6M8 15l-1 3h13" />
        <circle cx="9" cy="21" r="1" />
        <circle cx="18" cy="21" r="1" />
      </>
    ),
    user: (
      <>
        <circle cx="12" cy="8" r="4" />
        <path d="M4 21v-2a8 8 0 0 1 16 0v2" />
      </>
    ),
    logout: (
      <>
        <path d="M10 4H4v16h6M10 12h11m-4-4 4 4-4 4" />
      </>
    ),
    phone: (
      <>
        <rect x="6" y="2" width="12" height="20" rx="2" />
        <path d="M10 18h4M10 5h4" />
      </>
    ),
    trash: (
      <>
        <path d="M3 6h18M9 6V3h6v3M5 6l1 15h12l1-15M10 10v7M14 10v7" />
      </>
    ),
    check: <path d="m5 12 4 4L20 5" />,
    chevron: <path d="m9 5 7 7-7 7" />,
    close: <path d="m6 6 12 12M6 18 18 6" />,
  };
  return (
    <svg
      viewBox="0 0 24 24"
      width="24"
      height="24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {paths[name] || paths.grid}
    </svg>
  );
}
export const Photo = ({g, ...props}) => (
  <div className="photo">
    <img src={g.image} alt={g.name} loading="lazy" {...props} />
  </div>
);
export const Rating = ({v}) => (
  <span className="rating" aria-label={`Рейтинг ${v} из 5`}>
    <span className="stars" aria-hidden="true">
      <span style={{width: `${(v / 5) * 100}%`}}>★★★★★</span>★★★★★
    </span>
    <span>{v.toLocaleString('ru-RU')}</span>
  </span>
);
export const Labels = ({g}) => (
  <div className="labels">
    {g.isNew && <span className="label new">Новинка</span>}
    {g.isHit && <span className="label hit">Хит</span>}
  </div>
);

export function Modal({onClose, title, children, className = ''}) {
  const ref = useRef(null);
  const close = useRef(onClose);
  const titleId = useId();
  close.current = onClose;
  useEffect(() => {
    const dialog = ref.current;
    const previous = document.activeElement;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    dialog.showModal();
    return () => {
      dialog.close();
      document.body.style.overflow = overflow;
      if (previous?.isConnected) {
        previous.focus();
      }
    };
  }, []);
  return (
    <dialog
      ref={ref}
      className={`modal ${className}`}
      aria-labelledby={title ? titleId : undefined}
      aria-label={title ? undefined : 'Диалог'}
      onCancel={(e) => {
        e.preventDefault();
        close.current();
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          const r = e.currentTarget.getBoundingClientRect();
          if (
            e.clientX < r.left ||
            e.clientX > r.right ||
            e.clientY < r.top ||
            e.clientY > r.bottom
          ) {
            close.current();
          }
        }
      }}
    >
      <button
        type="button"
        className="close icon-button"
        onClick={onClose}
        aria-label="Закрыть"
      >
        <Icon name="close" />
      </button>
      {title && <h2 id={titleId}>{title}</h2>}
      {children}
    </dialog>
  );
}
export function Qty({id, q, min = 0, disabled = false}) {
  const {setQty, goods} = useApp();
  const name = goods.find((g) => g.id === id)?.name || 'товар';
  return (
    <div className="qty" role="group" aria-label={`Количество: ${name}`}>
      <button
        type="button"
        disabled={disabled || q <= min}
        onClick={() => setQty(id, q - 1)}
        aria-label={`Уменьшить количество: ${name}`}
      >
        −
      </button>
      <span aria-live="polite">
        {q} <small>шт.</small>
      </span>
      <button
        type="button"
        disabled={disabled || q >= 99}
        onClick={() => setQty(id, q + 1)}
        aria-label={`Увеличить количество: ${name}`}
      >
        +
      </button>
    </div>
  );
}
export function CartButton({id}) {
  const {user, qtyOf, setQty} = useApp();
  const navigate = useNavigate();
  const quantity = qtyOf(id);
  return quantity ? (
    <Qty id={id} q={quantity} />
  ) : (
    <button
      className="btn"
      onClick={() => (user ? setQty(id, 1) : navigate('/login'))}
    >
      В корзину
    </button>
  );
}
export function Card({g, onOpen, showCart = true}) {
  return (
    <article className="card">
      <button
        className="product-link"
        onClick={() => onOpen(g)}
        aria-label={`Подробнее: ${g.name}`}
      >
        <Labels g={g} />
        <Photo g={g} />
        <span className="price">{fmt(g.price)}</span>
        <span className="name" title={g.name}>
          {g.name}
        </span>
      </button>
      <Rating v={g.rating} />
      {showCart && <CartButton id={g.id} />}
    </article>
  );
}
export function ProductModal({g, onClose}) {
  return (
    <Modal onClose={onClose} className="product-modal" title={g.name}>
      <div className="product-detail">
        <div className="detail-photo">
          <Labels g={g} />
          <Photo g={g} />
        </div>
        <div>
          <Rating v={g.rating} />
          <p>{g.description}</p>
          <h3>Характеристики</h3>
          <dl className="specs">
            {Object.entries(g.specs).map(([key, value]) => (
              <div key={key}>
                <dt>{key}</dt>
                <dd>{value}</dd>
              </div>
            ))}
          </dl>
          <div className="purchase">
            <strong className="price">{fmt(g.price)}</strong>
            <CartButton id={g.id} />
          </div>
        </div>
      </div>
    </Modal>
  );
}
export function Field({label, error, required, ...props}) {
  const id = useId();
  return (
    <label className="field" htmlFor={id}>
      <span>
        {label}
        {required && <span className="required"> *</span>}
      </span>
      <input
        id={id}
        className={error ? 'invalid' : ''}
        required={required}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
        {...props}
      />
      {error && (
        <span className="error-text" id={`${id}-error`}>
          {error}
        </span>
      )}
    </label>
  );
}
