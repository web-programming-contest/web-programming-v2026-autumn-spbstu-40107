import { useState } from 'react'
import { useGoods } from '../hooks/useGoods.js'
import Button from '../components/Button.jsx'
import Checkbox from '../components/Checkbox.jsx'
import Pagination from '../components/Pagination.jsx'
import PriceRange from '../components/PriceRange.jsx'
import ProductCard from '../components/ProductCard.jsx'
import ProductModal from '../components/ProductModal.jsx'
import './Catalog.css'

const PER_PAGE = 6

const SORTS = [
  { value: 'new', label: 'Новые', compare: (a, b) => b.createdAt.localeCompare(a.createdAt) },
  { value: 'popular', label: 'Популярные', compare: (a, b) => b.popularity - a.popularity },
  { value: 'cheap', label: 'Подешевле', compare: (a, b) => a.price - b.price },
  { value: 'expensive', label: 'Подороже', compare: (a, b) => b.price - a.price },
]

const EMPTY_FILTERS = { from: null, to: null, categories: [], colors: [] }

const toBound = (value) => (value === null || value === '' ? null : Number(value))
const unique = (list) => [...new Set(list)].sort((a, b) => a.localeCompare(b))
const capitalize = (text) => text[0].toUpperCase() + text.slice(1)
const toggle = (list, value) =>
  list.includes(value) ? list.filter((item) => item !== value) : [...list, value]

function Catalog() {
  const { goods, loading, error } = useGoods()
  const [sort, setSort] = useState('new')
  const [draft, setDraft] = useState(EMPTY_FILTERS)
  const [filters, setFilters] = useState(EMPTY_FILTERS)
  const [page, setPage] = useState(1)
  const [openedProduct, setOpenedProduct] = useState(null)

  const prices = goods.map((product) => product.price)
  const minPrice = prices.length ? Math.min(...prices) : 0
  const maxPrice = prices.length ? Math.max(...prices) : 0
  const categories = unique(goods.map((product) => product.category))
  const colors = unique(goods.map((product) => product.color))

  const from = toBound(filters.from)
  const to = toBound(filters.to)
  const filtered = goods.filter(
    (product) =>
      (from === null || product.price >= from) &&
      (to === null || product.price <= to) &&
      (filters.categories.length === 0 || filters.categories.includes(product.category)) &&
      (filters.colors.length === 0 || filters.colors.includes(product.color)),
  )
  const sorted = [...filtered].sort(SORTS.find((item) => item.value === sort).compare)
  const pageCount = Math.ceil(sorted.length / PER_PAGE)
  const pageItems = sorted.slice((page - 1) * PER_PAGE, page * PER_PAGE)

  const changeSort = (value) => {
    setSort(value)
    setPage(1)
  }

  const changePage = (value) => {
    setPage(value)
    window.scrollTo({ top: 0 })
  }

  const applyFilters = (event) => {
    event.preventDefault()
    setFilters(draft)
    setPage(1)
  }

  const resetFilters = () => {
    setDraft(EMPTY_FILTERS)
    setFilters(EMPTY_FILTERS)
    setPage(1)
  }

  return (
    <div className="page catalog">
      <div className="container">
        <h1 className="title">Каталог товаров</h1>

        <div className="catalog__sorts">
          {SORTS.map((item) => (
            <button
              key={item.value}
              type="button"
              className={item.value === sort ? 'catalog__sort catalog__sort--active' : 'catalog__sort'}
              onClick={() => changeSort(item.value)}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="catalog__layout">
          <div className="catalog__content">
            {loading && <p>Загрузка...</p>}
            {error && <p className="catalog__message">{error}</p>}
            {!loading && !error && pageItems.length === 0 && (
              <p className="catalog__message">Товары по вашему запросу не найдены</p>
            )}

            <div className="catalog__grid">
              {pageItems.map((product) => (
                <ProductCard key={product.id} product={product} onOpen={setOpenedProduct} />
              ))}
            </div>

            <Pagination page={page} pageCount={pageCount} onChange={changePage} />
          </div>

          <form className="catalog__filters" onSubmit={applyFilters}>
            <fieldset className="catalog__group">
              <legend className="catalog__group-title">Цена, ₽</legend>
              <PriceRange
                min={minPrice}
                max={maxPrice}
                from={draft.from ?? minPrice}
                to={draft.to ?? maxPrice}
                onChange={(from, to) => setDraft({ ...draft, from, to })}
              />
            </fieldset>

            <fieldset className="catalog__group">
              <legend className="catalog__group-title">Тип товара</legend>
              {categories.map((category) => (
                <Checkbox
                  key={category}
                  label={category}
                  checked={draft.categories.includes(category)}
                  onChange={() => setDraft({ ...draft, categories: toggle(draft.categories, category) })}
                />
              ))}
            </fieldset>

            <fieldset className="catalog__group">
              <legend className="catalog__group-title">Цвет</legend>
              {colors.map((color) => (
                <Checkbox
                  key={color}
                  label={capitalize(color)}
                  checked={draft.colors.includes(color)}
                  onChange={() => setDraft({ ...draft, colors: toggle(draft.colors, color) })}
                />
              ))}
            </fieldset>

            <div className="catalog__actions">
              <Button type="submit">Показать</Button>
              <button type="button" className="catalog__reset" onClick={resetFilters}>
                Сбросить
              </button>
            </div>
          </form>
        </div>
      </div>

      {openedProduct && (
        <ProductModal product={openedProduct} onClose={() => setOpenedProduct(null)} />
      )}
    </div>
  )
}

export default Catalog
