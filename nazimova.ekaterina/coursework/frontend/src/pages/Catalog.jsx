import React, {useState, useMemo, useEffect} from 'react';
import ProductCard, {checkIsNew} from '../components/ProductCard';

const DEFAULT_TYPES = [
  'Смартфоны',
  'Фитнес браслеты',
  'Портативная акустика',
  'Очки виртуальной реальности',
  'Электротранспорт',
  'Умные часы',
];

const DEFAULT_COLORS = [
  'Красный',
  'Оранжевый',
  'Желтый',
  'Зеленый',
  'Голубой',
  'Синий',
  'Фиолетовый',
  'Розовый',
  'Черный',
  'Белый',
  'Серый',
  'Бежевый',
];

const ITEMS_PER_PAGE = 9;

function Catalog({goods, cart, onAddToCart, onUpdateQuantity, onOpenModal}) {
  const prices = useMemo(() => goods.map((g) => Number(g.price) || 0), [goods]);
  const minCatalogPrice = prices.length ? Math.min(...prices) : 0;
  const maxCatalogPrice = prices.length ? Math.max(...prices) : 150000;

  const [draftMinPrice, setDraftMinPrice] = useState('');
  const [draftMaxPrice, setDraftMaxPrice] = useState('');
  const [draftTypes, setDraftTypes] = useState([]);
  const [draftColors, setDraftColors] = useState([]);

  const [appliedFilters, setAppliedFilters] = useState({
    minPrice: '',
    maxPrice: '',
    types: [],
    colors: [],
  });

  const [sortBy, setSortBy] = useState('new');
  const [currentPage, setCurrentPage] = useState(1);

  const availableTypes = useMemo(() => {
    const fromData = goods.map((g) => g.category || g.type).filter(Boolean);
    return Array.from(new Set([...DEFAULT_TYPES, ...fromData]));
  }, [goods]);

  const availableColors = useMemo(() => {
    const fromData = goods
      .map((g) => g.color)
      .filter(Boolean)
      .map((c) => c.charAt(0).toUpperCase() + c.slice(1).toLowerCase());
    return Array.from(new Set([...DEFAULT_COLORS.slice(0, 7), ...fromData]));
  }, [goods]);

  const toggleDraftItem = (list, setList, value) => {
    if (list.includes(value)) {
      setList(list.filter((item) => item !== value));
    } else {
      setList([...list, value]);
    }
  };

  const handleApplyFilters = (e) => {
    e.preventDefault();
    setAppliedFilters({
      minPrice: draftMinPrice,
      maxPrice: draftMaxPrice,
      types: draftTypes,
      colors: draftColors,
    });
    setCurrentPage(1);
  };

  const handleResetFilters = () => {
    setDraftMinPrice('');
    setDraftMaxPrice('');
    setDraftTypes([]);
    setDraftColors([]);
    setAppliedFilters({
      minPrice: '',
      maxPrice: '',
      types: [],
      colors: [],
    });
    setCurrentPage(1);
  };

  const filteredAndSortedGoods = useMemo(() => {
    let result = [...goods];

    if (appliedFilters.minPrice !== '') {
      result = result.filter(
        (g) => Number(g.price) >= Number(appliedFilters.minPrice),
      );
    }
    if (appliedFilters.maxPrice !== '') {
      result = result.filter(
        (g) => Number(g.price) <= Number(appliedFilters.maxPrice),
      );
    }

    if (appliedFilters.types.length > 0) {
      result = result.filter((g) => {
        const itemType = (g.category || g.type || '').toLowerCase();
        const itemTitle = (g.name || g.title || '').toLowerCase();
        return appliedFilters.types.some((t) => {
          const lowerT = t.toLowerCase();
          return (
            itemType === lowerT ||
            itemType.includes(lowerT.slice(0, 5)) ||
            itemTitle.includes(lowerT.slice(0, 5))
          );
        });
      });
    }

    if (appliedFilters.colors.length > 0) {
      result = result.filter((g) => {
        const itemColor = (g.color || '').toLowerCase();
        const itemTitle = (g.name || g.title || '').toLowerCase();
        return appliedFilters.colors.some((c) => {
          const stem = c.toLowerCase().slice(0, 4);
          return itemColor.includes(stem) || itemTitle.includes(stem);
        });
      });
    }

    result.sort((a, b) => {
      if (sortBy === 'new') {
        return Number(checkIsNew(b)) - Number(checkIsNew(a));
      }
      if (sortBy === 'popular') {
        return (Number(b.rating) || 0) - (Number(a.rating) || 0);
      }
      if (sortBy === 'price_asc') {
        return Number(a.price) - Number(b.price);
      }
      if (sortBy === 'price_desc') {
        return Number(b.price) - Number(a.price);
      }
      return 0;
    });

    return result;
  }, [goods, appliedFilters, sortBy]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredAndSortedGoods.length / ITEMS_PER_PAGE),
  );

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(1);
    }
  }, [totalPages, currentPage]);

  const paginatedGoods = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredAndSortedGoods.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredAndSortedGoods, currentPage]);

  const renderPaginationButtons = () => {
    if (totalPages <= 1) {
      return null;
    }

    const pages = [];
    if (totalPages <= 3) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1, 2, 3);
      if (currentPage > 3 && currentPage < totalPages) {
        pages.push(currentPage);
      }
      pages.push('...', totalPages);
    }

    return (
      <div className="pagination">
        {pages.map((p, idx) =>
          p === '...' ? (
            <span key={`dots-${idx}`} className="pagination-dots">
              ...
            </span>
          ) : (
            <button
              key={p}
              type="button"
              className={`pagination-btn ${currentPage === p ? 'active' : ''}`}
              onClick={() => setCurrentPage(p)}
            >
              {p}
            </button>
          ),
        )}
        {currentPage < totalPages && (
          <button
            type="button"
            className="pagination-btn pagination-next"
            onClick={() =>
              setCurrentPage((prev) => Math.min(totalPages, prev + 1))
            }
          >
            ›
          </button>
        )}
      </div>
    );
  };

  const sliderMinVal =
    draftMinPrice === '' ? minCatalogPrice : Number(draftMinPrice);
  const sliderMaxVal =
    draftMaxPrice === '' ? maxCatalogPrice : Number(draftMaxPrice);

  return (
    <div className="catalog-page container">
      <h1 className="page-title">Каталог товаров</h1>

      <div className="sort-chips">
        <button
          type="button"
          className={`chip ${sortBy === 'new' ? 'active' : ''}`}
          onClick={() => setSortBy('new')}
        >
          Новые
        </button>
        <button
          type="button"
          className={`chip ${sortBy === 'popular' ? 'active' : ''}`}
          onClick={() => setSortBy('popular')}
        >
          Популярные
        </button>
        <button
          type="button"
          className={`chip ${sortBy === 'price_asc' ? 'active' : ''}`}
          onClick={() => setSortBy('price_asc')}
        >
          Подешевле
        </button>
        <button
          type="button"
          className={`chip ${sortBy === 'price_desc' ? 'active' : ''}`}
          onClick={() => setSortBy('price_desc')}
        >
          Подороже
        </button>
      </div>

      <div className="catalog-layout">
        <div className="catalog-main">
          {paginatedGoods.length === 0 ? (
            <div className="empty-catalog-message">
              Товары по вашему запросу не найдены
            </div>
          ) : (
            <div className="catalog-grid">
              {paginatedGoods.map((item) => (
                <ProductCard
                  key={item.id}
                  product={item}
                  cartItem={cart.find((c) => c.id === item.id)}
                  onAddToCart={onAddToCart}
                  onUpdateQuantity={onUpdateQuantity}
                  onOpenModal={onOpenModal}
                  showCartControls={true}
                />
              ))}
            </div>
          )}

          {renderPaginationButtons()}
        </div>

        <aside className="catalog-sidebar">
          <form onSubmit={handleApplyFilters} className="filters-form">
            <div className="filter-group">
              <h3 className="filter-title">Цена, ₽</h3>
              <div className="price-inputs">
                <div className="price-field">
                  <label>От</label>
                  <input
                    type="number"
                    placeholder={String(minCatalogPrice)}
                    value={draftMinPrice}
                    onChange={(e) => setDraftMinPrice(e.target.value)}
                  />
                </div>
                <div className="price-field">
                  <label>До</label>
                  <input
                    type="number"
                    placeholder={String(maxCatalogPrice)}
                    value={draftMaxPrice}
                    onChange={(e) => setDraftMaxPrice(e.target.value)}
                  />
                </div>
              </div>

              <div className="range-slider-box">
                <input
                  type="range"
                  min={minCatalogPrice}
                  max={maxCatalogPrice}
                  value={sliderMinVal}
                  onChange={(e) => {
                    const val = Math.min(Number(e.target.value), sliderMaxVal);
                    setDraftMinPrice(String(val));
                  }}
                  className="range-input"
                />
                <input
                  type="range"
                  min={minCatalogPrice}
                  max={maxCatalogPrice}
                  value={sliderMaxVal}
                  onChange={(e) => {
                    const val = Math.max(Number(e.target.value), sliderMinVal);
                    setDraftMaxPrice(String(val));
                  }}
                  className="range-input"
                />
              </div>
            </div>

            <div className="filter-group">
              <h3 className="filter-title">Тип товара</h3>
              <div className="checkbox-list">
                {availableTypes.map((type) => (
                  <label key={type} className="custom-checkbox">
                    <input
                      type="checkbox"
                      checked={draftTypes.includes(type)}
                      onChange={() =>
                        toggleDraftItem(draftTypes, setDraftTypes, type)
                      }
                    />
                    <span className="checkmark" />
                    <span className="checkbox-label">{type}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="filter-group">
              <h3 className="filter-title">Цвет</h3>
              <div className="checkbox-list">
                {availableColors.map((color) => (
                  <label key={color} className="custom-checkbox">
                    <input
                      type="checkbox"
                      checked={draftColors.includes(color)}
                      onChange={() =>
                        toggleDraftItem(draftColors, setDraftColors, color)
                      }
                    />
                    <span className="checkmark" />
                    <span className="checkbox-label">{color}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="filter-actions">
              <button type="submit" className="btn btn--blue">
                Показать
              </button>
              <button
                type="button"
                className="btn-reset"
                onClick={handleResetFilters}
              >
                Сбросить
              </button>
            </div>
          </form>
        </aside>
      </div>
    </div>
  );
}

export default Catalog;
