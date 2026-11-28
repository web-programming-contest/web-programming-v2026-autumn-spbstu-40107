import {useState} from 'react';
import {useApp} from '../ctx.js';
import {Card, ProductModal, TYPES, COLORS, Icon} from '../ui.jsx';
import {filterGoods, sortGoods, pageNumbers} from '../catalog.js';
const PER_PAGE = 9;
const toggle = (items, value) =>
  items.includes(value)
    ? items.filter((item) => item !== value)
    : [...items, value];
export default function Catalog() {
  const {goods} = useApp();
  const typeKeys = Object.keys(TYPES).filter((key) =>
    goods.some((g) => g.type === key),
  );
  const colorKeys = Object.keys(COLORS).filter((key) =>
    goods.some((g) => g.color === key),
  );
  const max = Math.max(0, ...goods.map((g) => g.price));
  const initial = {min: '', max: '', types: typeKeys, colors: colorKeys};
  const [draft, setDraft] = useState(initial);
  const [filters, setFilters] = useState(initial);
  const [sort, setSort] = useState('new');
  const [direction, setDirection] = useState('desc');
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState(null);
  const [error, setError] = useState('');
  const filtered = filterGoods(goods, filters);
  const sorted = sortGoods(
    filtered,
    ['cheap', 'expensive'].includes(sort) ? 'price' : sort,
    direction,
  );
  const pages = Math.ceil(sorted.length / PER_PAGE);
  const current = Math.min(page, Math.max(1, pages));
  const visible = sorted.slice((current - 1) * PER_PAGE, current * PER_PAGE);
  const pagination = pageNumbers(pages);
  const changeSort = (key) => {
    setSort(key);
    setDirection(key === 'cheap' ? 'asc' : 'desc');
    setPage(1);
  };
  const changeDirection = (value) => {
    setDirection(value);
    if (sort === 'cheap' || sort === 'expensive') {
      setSort(value === 'asc' ? 'cheap' : 'expensive');
    }
    setPage(1);
  };
  const change = (key, value) => {
    setDraft({
      ...draft,
      [key]: key === 'min' || key === 'max' ? String(value) : value,
    });
    setError('');
  };
  const apply = (event) => {
    event.preventDefault();
    const low = Number(draft.min || 0);
    const high = Number(draft.max || max);
    if (
      !Number.isFinite(low) ||
      !Number.isFinite(high) ||
      low < 0 ||
      high < low
    ) {
      setError('Укажите корректный диапазон цены: «от» не больше «до».');
      return;
    }
    setFilters(draft);
    setPage(1);
    setError('');
  };
  const reset = () => {
    setDraft(initial);
    setFilters(initial);
    setPage(1);
    setError('');
  };
  const go = (number) => {
    setPage(number);
    document.getElementById('catalog-title')?.scrollIntoView({block: 'start'});
  };
  const group = (label, key, keys, names) => (
    <fieldset className="filter-group">
      <legend>{label}</legend>
      <label className="check-label select-all">
        <input
          type="checkbox"
          checked={draft[key].length === keys.length}
          onChange={() =>
            change(key, draft[key].length === keys.length ? [] : keys)
          }
        />
        Выбрать все
      </label>
      {keys.map((value) => (
        <label className="check-label" key={value}>
          <input
            type="checkbox"
            checked={draft[key].includes(value)}
            onChange={() => change(key, toggle(draft[key], value))}
          />
          {names[value]}
        </label>
      ))}
    </fieldset>
  );
  return (
    <>
      <div className="page-heading">
        <h1 id="catalog-title">Каталог товаров</h1>
        <span className="muted" aria-live="polite">
          Найдено: {filtered.length}
        </span>
      </div>
      <div className="catalog">
        <div className="catalog-content">
          <div className="sortbar" role="group" aria-label="Сортировка">
            {[
              ['new', 'Новые'],
              ['expensive', 'Подороже'],
              ['cheap', 'Подешевле'],
              ['popular', 'Популярные'],
            ].map(([key, label]) => (
              <button
                key={key}
                className={sort === key ? 'sort-chip active' : 'sort-chip'}
                aria-pressed={sort === key}
                onClick={() => changeSort(key)}
              >
                {label}
              </button>
            ))}
            <select
              className="sort-direction"
              aria-label="Направление сортировки"
              value={direction}
              onChange={(e) => changeDirection(e.target.value)}
            >
              <option value="desc">По убыванию</option>
              <option value="asc">По возрастанию</option>
            </select>
          </div>
          {visible.length ? (
            <div className="product-grid">
              {visible.map((g) => (
                <Card key={g.id} g={g} onOpen={setOpen} />
              ))}
            </div>
          ) : (
            <div className="empty">
              <Icon name="grid" width="48" height="48" />
              <h2>Ничего не найдено</h2>
              <p>
                Товары по вашему запросу не найдены. Попробуйте изменить фильтры
                или сбросить их.
              </p>
              <button className="btn ghost" onClick={reset}>
                Сбросить фильтры
              </button>
            </div>
          )}
          {pages > 1 && (
            <nav className="pagination" aria-label="Страницы каталога">
              <button
                onClick={() => go(current - 1)}
                disabled={current === 1}
                aria-label="Предыдущая страница"
              >
                <span aria-hidden="true">‹</span>
              </button>
              {pagination.map((n) =>
                typeof n === 'string' ? (
                  <span key={n}>…</span>
                ) : (
                  <button
                    key={n}
                    className={n === current ? 'active' : ''}
                    aria-current={n === current ? 'page' : undefined}
                    aria-label={`Страница ${n}`}
                    onClick={() => go(n)}
                  >
                    {n}
                  </button>
                ),
              )}
              <button
                onClick={() => go(current + 1)}
                disabled={current === pages}
                aria-label="Следующая страница"
              >
                <span aria-hidden="true">›</span>
              </button>
            </nav>
          )}
          {pages > 1 && (
            <p className="page-status" role="status">
              Страница {current} из {pages}
            </p>
          )}
        </div>
        <form className="filters" onSubmit={apply} noValidate>
          <fieldset className="filter-group">
            <legend>Цена, ₽</legend>
            <div className="price-fields">
              <label>
                От
                <input
                  type="number"
                  min="0"
                  inputMode="numeric"
                  placeholder="0"
                  value={draft.min}
                  onChange={(e) => change('min', e.target.value)}
                />
              </label>
              <label>
                До
                <input
                  type="number"
                  min="0"
                  inputMode="numeric"
                  placeholder={max}
                  value={draft.max}
                  onChange={(e) => change('max', e.target.value)}
                />
              </label>
            </div>
            <label className="range-label">
              Минимальная цена
              <input
                type="range"
                min="0"
                max={max}
                step="1"
                value={Math.min(max, Number(draft.min || 0))}
                onChange={(e) =>
                  change(
                    'min',
                    Math.min(Number(e.target.value), Number(draft.max || max)),
                  )
                }
              />
            </label>
            <label className="range-label">
              Максимальная цена
              <input
                type="range"
                min="0"
                max={max}
                step="1"
                value={Math.min(max, Number(draft.max || max))}
                onChange={(e) =>
                  change(
                    'max',
                    Math.max(Number(e.target.value), Number(draft.min || 0)),
                  )
                }
              />
            </label>
            {error && (
              <p className="error-text" role="alert">
                {error}
              </p>
            )}
          </fieldset>
          {group('Тип товара', 'types', typeKeys, TYPES)}
          {group('Цвет', 'colors', colorKeys, COLORS)}
          <div className="filter-actions">
            <button type="submit" className="btn">
              Показать
            </button>
            <button type="button" className="text-button" onClick={reset}>
              Сбросить
            </button>
          </div>
        </form>
      </div>
      {open && <ProductModal g={open} onClose={() => setOpen(null)} />}
    </>
  );
}
