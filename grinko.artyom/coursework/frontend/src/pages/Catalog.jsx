import ProductCard from '../components/ProductCard';
import { useApp } from '../context/AppContext';

const SORT_OPTIONS = [
  { value: 'new', label: 'Новые' },
  { value: 'popular', label: 'Популярные' },
  { value: 'price_asc', label: 'Подешевле' },
  { value: 'price_desc', label: 'Подороже' }
];

export default function Catalog() {
  const {
    sortBy,
    setSortBy,
    paginatedGoods,
    filteredAndSortedGoods,
    currentPage,
    setCurrentPage,
    totalPages,
    ITEMS_PER_PAGE,
    draftPriceFrom,
    setDraftPriceFrom,
    draftPriceTo,
    setDraftPriceTo,
    draftTypes,
    setDraftTypes,
    draftColors,
    setDraftColors,
    PRODUCT_TYPES,
    PRODUCT_COLORS,
    handleApplyFilters,
    handleResetFilters,
    toggleCheckboxList
  } = useApp();

  const renderPageNumbers = () => {
    if (totalPages <= 3) {
      return Array.from({ length: totalPages }, (_, index) => index + 1).map((number) => (
        <button
          key={number}
          type="button"
          className={`page-btn ${currentPage === number ? 'active' : ''}`}
          onClick={() => setCurrentPage(number)}
        >
          {number}
        </button>
      ));
    }

    return (
      <>
        {[1, 2, 3].map((number) => (
          <button
            key={number}
            type="button"
            className={`page-btn ${currentPage === number ? 'active' : ''}`}
            onClick={() => setCurrentPage(number)}
          >
            {number}
          </button>
        ))}
        <span className="page-dots">...</span>
        <button
          type="button"
          className={`page-btn ${currentPage === totalPages ? 'active' : ''}`}
          onClick={() => setCurrentPage(totalPages)}
        >
          {totalPages}
        </button>
      </>
    );
  };

  return (
    <div className="container catalog-page">
      <h1>Каталог товаров</h1>

      <div className="sort-bar">
        {SORT_OPTIONS.map((option) => (
          <button
            key={option.value}
            type="button"
            className={`sort-chip ${sortBy === option.value ? 'active' : ''}`}
            onClick={() => setSortBy(option.value)}
          >
            {option.label}
          </button>
        ))}
      </div>

      <div className="catalog-layout">
        <div className="catalog-main">
          {paginatedGoods.length === 0 ? (
            <div className="empty-catalog-msg">
              Товары по вашему запросу не найдены. Попробуйте изменить параметры фильтрации.
            </div>
          ) : (
            <div className="catalog-grid">
              {paginatedGoods.map((item) => (
                <ProductCard key={item.id} product={item} withActions />
              ))}
            </div>
          )}

          {filteredAndSortedGoods.length > ITEMS_PER_PAGE && (
            <div className="pagination">
              {renderPageNumbers()}
              <button
                type="button"
                className="page-btn"
                onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
              >
                ›
              </button>
            </div>
          )}
        </div>

        <aside className="catalog-filters">
          <form onSubmit={handleApplyFilters}>
            <div className="filter-block">
              <h3>Цена, ₽</h3>
              <div className="price-inputs">
                <div>
                  <label>От</label>
                  <input
                    type="number"
                    placeholder="2990"
                    value={draftPriceFrom}
                    onChange={(event) => setDraftPriceFrom(event.target.value)}
                  />
                </div>
                <div>
                  <label>До</label>
                  <input
                    type="number"
                    placeholder="167890"
                    value={draftPriceTo}
                    onChange={(event) => setDraftPriceTo(event.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="filter-block">
              <h3>Тип товара</h3>
              {PRODUCT_TYPES.map((type) => (
                <label key={type} className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={draftTypes.includes(type)}
                    onChange={() => toggleCheckboxList(draftTypes, setDraftTypes, type)}
                  />
                  <span>{type}</span>
                </label>
              ))}
            </div>

            <div className="filter-block">
              <h3>Цвет</h3>
              {PRODUCT_COLORS.map((color) => (
                <label key={color} className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={draftColors.includes(color)}
                    onChange={() => toggleCheckboxList(draftColors, setDraftColors, color)}
                  />
                  <span>{color}</span>
                </label>
              ))}
            </div>

            <div className="filter-buttons">
              <button type="submit" className="btn-blue">
                Показать
              </button>
              <button type="button" className="btn-reset" onClick={handleResetFilters}>
                Сбросить
              </button>
            </div>
          </form>
        </aside>
      </div>
    </div>
  );
}
