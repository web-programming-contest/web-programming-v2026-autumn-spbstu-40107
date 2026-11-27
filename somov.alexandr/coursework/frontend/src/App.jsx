import {useEffect, useState} from 'react';
import {Link, Navigate, Route, Routes, useLocation, useNavigate} from 'react-router-dom';
import Home from './Home.jsx';
import Catalog from './Catalog.jsx';
import useGoods from './useGoods.js';
import {useCart} from './context/CartContext.jsx';
import {useAuth} from './context/AuthContext.jsx';
import Login from './Login.jsx';
import Cart from './Cart.jsx';
import {Header, Footer} from './components/Layout.jsx';
import ProductModal from './components/ProductModal.jsx';

function RequireAuth({children}) {
  const auth = useAuth();
  if (auth.loading) return <div className="container status-page" role="status">Проверяем вход…</div>;
  if (auth.user) return children;
  if (auth.error) return <div className="container status-page" role="alert"><h1>Не удалось проверить вход</h1><p>{auth.error}</p><button className="button" onClick={() => auth.refresh()}>Попробовать снова</button></div>;
  return <Navigate to="/login" replace />;
}

export default function App() {
  const {goods, loading, error, retry} = useGoods();
  const {storageError} = useCart();
  const auth = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  useEffect(() => { setProduct(null); }, [location.pathname]);
  let goodsStatus = null;

  if (loading) {
    goodsStatus = <div className="container status-page" role="status">Загружаем товары…</div>;
  } else if (error) {
    goodsStatus = (
      <div className="container status-page" role="alert">
        <h1>Не удалось загрузить товары</h1>
        <p>{error}</p>
        <button className="button" onClick={retry}>Попробовать снова</button>
      </div>
    );
  }

  return (
    <>
      <a className="skip-link" href="#main">Перейти к содержимому</a>
      <Header user={auth.user} onLogout={async () => { if (await auth.logout()) navigate('/'); }} />
      {auth.error && <div className="connection-warning" role="alert">{auth.error}<button className="text-button" onClick={() => auth.refresh()}>Проверить соединение</button></div>}
      {storageError && <p className="container field-error" role="alert">{storageError}</p>}
      <main id="main">
        <Routes>
          <Route path="/" element={goodsStatus || <Home goods={goods} onOpen={setProduct} />} />
          <Route path="/catalog" element={<RequireAuth>{goodsStatus || <Catalog goods={goods} onOpen={setProduct} />}</RequireAuth>} />
          <Route path="/login" element={<Login />} />
          <Route path="/cart" element={<RequireAuth>{goodsStatus || <Cart goods={goods} onOpen={setProduct} />}</RequireAuth>} />
          <Route path="*" element={
            <div className="container status-page">
              <h1>Страница не найдена</h1>
              <Link className="button" to="/">На главную</Link>
            </div>
          } />
        </Routes>
      </main>
      <Footer />
      {product && <ProductModal product={product} onClose={() => setProduct(null)} />}
    </>
  );
}
