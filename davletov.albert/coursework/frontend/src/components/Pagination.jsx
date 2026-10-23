import './Pagination.css'

const getPages = (page, pageCount) => {
  if (pageCount <= 4) {
    return Array.from({ length: pageCount }, (_, i) => i + 1)
  }
  if (page <= 3) {
    return [1, 2, 3, '...', pageCount]
  }
  if (page >= pageCount - 2) {
    return [1, '...', pageCount - 2, pageCount - 1, pageCount]
  }
  return [1, '...', page - 1, page, page + 1, '...', pageCount]
}

function Pagination({ page, pageCount, onChange }) {
  if (pageCount <= 1) {
    return null
  }

  return (
    <nav className="pagination">
      {page > 1 && (
        <button
          type="button"
          className="pagination__arrow"
          onClick={() => onChange(page - 1)}
          aria-label="Предыдущая страница"
        />
      )}

      {getPages(page, pageCount).map((item, index) =>
        item === '...' ? (
          <span key={`dots-${index}`} className="pagination__dots">
            ...
          </span>
        ) : (
          <button
            key={item}
            type="button"
            className={item === page ? 'pagination__page pagination__page--active' : 'pagination__page'}
            onClick={() => onChange(item)}
          >
            {item}
          </button>
        ),
      )}

      {page < pageCount && (
        <button
          type="button"
          className="pagination__arrow pagination__arrow--next"
          onClick={() => onChange(page + 1)}
          aria-label="Следующая страница"
        />
      )}
    </nav>
  )
}

export default Pagination
