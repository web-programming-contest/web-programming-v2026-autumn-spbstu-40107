import { setImageFallback } from './ProductCard';
import { useApp } from '../context/AppContext';

export default function Modals() {
  const {
    selectedProduct,
    setSelectedProduct,
    loginServerError,
    setLoginServerError,
    deleteConfirmModal,
    setDeleteConfirmModal,
    confirmDeleteAction,
    orderSuccessModal,
    closeOrderSuccess,
    getQuantity,
    addToCart,
    changeQuantity
  } = useApp();

  return (
    <>
      {selectedProduct && (
        <div className="modal-overlay" onClick={() => setSelectedProduct(null)}>
          <div className="modal-card" onClick={(event) => event.stopPropagation()}>
            <button
              type="button"
              className="modal-close"
              onClick={() => setSelectedProduct(null)}
            >
              ✕
            </button>
            <div className="modal-body">
              <div className="modal-img-box">
                <div className="badges">
                  {selectedProduct.isNew && <span className="badge badge-new">Новинка</span>}
                  {selectedProduct.isHit && <span className="badge badge-hit">Хит</span>}
                </div>
                <img
                  src={selectedProduct.image}
                  alt={selectedProduct.name}
                  onError={setImageFallback}
                />
              </div>

              <div className="modal-details">
                <h2>{selectedProduct.name}</h2>
                <div className="card-rating">⭐ {selectedProduct.rating}</div>
                <p className="modal-desc">{selectedProduct.description}</p>

                <h3>Характеристики</h3>
                <div className="specs-list">
                  {Object.entries(selectedProduct.specs || {}).map(([key, value]) => (
                    <div key={key} className="spec-row">
                      <span className="spec-key">{key}</span>
                      <span className="spec-dots" />
                      <span className="spec-val">{value}</span>
                    </div>
                  ))}
                </div>

                <div className="modal-footer-price">
                  <div className="modal-price">{selectedProduct.price} ₽</div>
                  {getQuantity(selectedProduct.id) === 0 ? (
                    <button
                      type="button"
                      className="btn-blue"
                      onClick={() => addToCart(selectedProduct.id)}
                    >
                      🛒 В корзину
                    </button>
                  ) : (
                    <div className="card-qty-row">
                      <div className="qty-controls">
                        <button
                          type="button"
                          onClick={() => changeQuantity(selectedProduct.id, -1)}
                        >
                          −
                        </button>
                        <span>{getQuantity(selectedProduct.id)}</span>
                        <button
                          type="button"
                          onClick={() => changeQuantity(selectedProduct.id, 1)}
                        >
                          +
                        </button>
                      </div>
                      <span className="btn-pink">
                        🛒 В корзине {getQuantity(selectedProduct.id)} шт.
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {loginServerError && (
        <div className="modal-overlay" onClick={() => setLoginServerError('')}>
          <div className="confirm-modal" onClick={(event) => event.stopPropagation()}>
            <button
              type="button"
              className="modal-close"
              onClick={() => setLoginServerError('')}
            >
              ✕
            </button>
            <h3>Ошибка авторизации</h3>
            <p>{loginServerError}</p>
            <div className="confirm-actions">
              <button type="button" className="btn-blue" onClick={() => setLoginServerError('')}>
                Ок
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteConfirmModal && (
        <div className="modal-overlay" onClick={() => setDeleteConfirmModal(null)}>
          <div className="confirm-modal" onClick={(event) => event.stopPropagation()}>
            <button
              type="button"
              className="modal-close"
              onClick={() => setDeleteConfirmModal(null)}
            >
              ✕
            </button>
            <h3>Вы уверены, что хотите удалить?</h3>
            <div className="confirm-actions">
              <button
                type="button"
                className="btn-reset"
                onClick={() => setDeleteConfirmModal(null)}
              >
                Отмена
              </button>
              <button type="button" className="btn-blue" onClick={confirmDeleteAction}>
                Да, удалить
              </button>
            </div>
          </div>
        </div>
      )}

      {orderSuccessModal && (
        <div className="modal-overlay" onClick={closeOrderSuccess}>
          <div className="confirm-modal" onClick={(event) => event.stopPropagation()}>
            <button type="button" className="modal-close" onClick={closeOrderSuccess}>
              ✕
            </button>
            <h3>Спасибо, ваш заказ успешно оформлен</h3>
            <div className="confirm-actions">
              <button type="button" className="btn-blue" onClick={closeOrderSuccess}>
                Ок
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
