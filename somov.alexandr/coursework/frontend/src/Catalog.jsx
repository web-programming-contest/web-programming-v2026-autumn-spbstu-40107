import {useState} from 'react';
import {emptyFilters, filterGoods, PAGE_SIZE, pageNumbers} from './catalog.js';
import ProductCard from './components/ProductCard.jsx';
import Icon from './components/Icon.jsx';

const sortingOptions = [
  {key: 'createdAt', direction: 'desc', label: 'Новые'},
  {key: 'popularity', direction: 'desc', label: 'Популярные'},
  {key: 'price', direction: 'asc', label: 'Подешевле'},
  {key: 'price', direction: 'desc', label: 'Подороже'},
];

function FilterGroup({title, values, selected, onChange}) {
  return (
    <fieldset className="filter-group">
      <legend>{title}</legend>
      {values.map((value) => (
        <label className="checkbox-label" key={value}>
          <input type="checkbox" checked={selected.includes(value)} onChange={() => onChange(value)} />
          {value}
        </label>
      ))}
    </fieldset>
  );
}

export default function Catalog({goods, onOpen}) {
  const [draft, setDraft] = useState(emptyFilters);
  const [filters, setFilters] = useState(emptyFilters);
  const [sortBy, setSortBy] = useState('createdAt');
  const [direction, setDirection] = useState('desc');
  const [page, setPage] = useState(1);
  const [filterError, setFilterError] = useState('');
  const result = filterGoods(goods, filters, sortBy, direction);
  const totalPages = Math.ceil(result.length / PAGE_SIZE);
  const currentPage = Math.min(page, totalPages) || 1;
  const visible = result.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const values = (key) => [...new Set(goods.map((product) => product[key]))].sort((a, b) => a.localeCompare(b, 'ru'));

  function toggle(key, value) {
    const selected = draft[key];
    setDraft({...draft, [key]: selected.includes(value) ? selected.filter((item) => item !== value) : [...selected, value]});
  }

  function apply(event) {
    event.preventDefault();
    if (draft.priceFrom !== '' && draft.priceTo !== '' && Number(draft.priceFrom) > Number(draft.priceTo)) {
      setFilterError('Цена «От» не должна превышать цену «До».');
      return;
    }
    setFilterError('');
    setFilters(draft);
    setPage(1);
  }

  function reset() {
    setDraft(emptyFilters);
    setFilters(emptyFilters);
    setFilterError('');
    setPage(1);
  }

  function sort(key, order) {
    setSortBy(key);
    setDirection(order);
    setPage(1);
  }

  return (
    <div className="container catalog-page">
      <h1>Каталог товаров</h1>
      <div className="catalog-layout">
        <section className="catalog-results" aria-label="Товары">
          <div className="sorting" aria-label="Сортировка товаров">
            {sortingOptions.map((option) => {
              const active = sortBy === option.key && (option.key !== 'price' || direction === option.direction);
              return (
                <button key={option.label} className={`sort-button${active ? ' active' : ''}`} aria-pressed={active} onClick={() => sort(option.key, option.direction)}>
                  {option.label}
                </button>
              );
            })}
            <select className="sort-direction" aria-label="Направление сортировки" value={direction} onChange={(event) => sort(sortBy, event.target.value)}><option value="desc">По убыванию</option><option value="asc">По возрастанию</option></select>
          </div>
          {visible.length ? <div className="product-grid">{visible.map((product) => <ProductCard key={product.id} product={product} onOpen={onOpen} />)}</div>
            : <div className="empty-result" role="status"><h2>Товары не найдены</h2><p>Попробуйте изменить условия поиска или сбросить фильтры.</p><button className="button" onClick={reset}>Сбросить фильтры</button></div>}
          {totalPages > 1 && <nav className="pagination" aria-label="Страницы каталога">
            <button className="arrow-button arrow-left" onClick={() => setPage(currentPage - 1)} disabled={currentPage === 1} aria-label="Предыдущая страница"><Icon name="arrow" /></button>
            {pageNumbers(totalPages, currentPage).map((number, index) => number === '…' ? <span key={`gap-${index}`} aria-hidden="true">…</span> : <button key={number} className={number === currentPage ? 'page-button active' : 'page-button'} onClick={() => setPage(number)} aria-label={`Страница ${number}`} aria-current={number === currentPage ? 'page' : undefined}>{number}</button>)}
            <button className="arrow-button" onClick={() => setPage(currentPage + 1)} disabled={currentPage === totalPages} aria-label="Следующая страница"><Icon name="arrow" /></button>
          </nav>}
          <p className="results-count" aria-live="polite">Найдено товаров: {result.length}</p>
        </section>
        <aside className="catalog-filters" aria-label="Фильтры товаров">
          <form onSubmit={apply}>
            <fieldset className="filter-group"><legend>Цена, ₽</legend><div className="price-fields">
              <label>От<input type="number" min="0" step="1" placeholder="0" value={draft.priceFrom} onChange={(event) => setDraft({...draft, priceFrom: event.target.value})} /></label>
              <label>До<input type="number" min="0" step="1" placeholder="Любая" value={draft.priceTo} onChange={(event) => setDraft({...draft, priceTo: event.target.value})} /></label>
            </div>{filterError && <p className="field-error" role="alert">{filterError}</p>}</fieldset>
            <FilterGroup title="Тип товара" values={values('type')} selected={draft.types} onChange={(value) => toggle('types', value)} />
            <FilterGroup title="Цвет" values={values('color')} selected={draft.colors} onChange={(value) => toggle('colors', value)} />
            <div className="filter-actions"><button className="button" type="submit">Показать</button><button className="text-button" type="button" onClick={reset}>Сбросить</button></div>
          </form>
        </aside>
      </div>
    </div>
  );
}
