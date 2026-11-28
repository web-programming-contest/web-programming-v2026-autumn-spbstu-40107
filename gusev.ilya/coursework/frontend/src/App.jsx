import {useEffect, useState} from 'react';
import {
  Routes,
  Route,
  Link,
  NavLink,
  Navigate,
  useNavigate,
  useLocation,
} from 'react-router-dom';
import {Ctx, useApp} from './ctx.js';
import {api} from './api.js';
import {useCart} from './cart.js';
import {BrandMark, Icon, Modal} from './ui.jsx';
import Home from './pages/Home.jsx';
import Login from './pages/Login.jsx';
import Catalog from './pages/Catalog.jsx';
import Cart from './pages/Cart.jsx';

function Header() {
  const {user, setUser, cart} = useApp();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const logout = async () => {
    setBusy(true);
    try {
      await api.logout();
      setUser(null);
      navigate('/');
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };
  const count = cart.reduce((sum, item) => sum + item.quantity, 0);
  return (
    <header className="header">
      <div className="container header-bar">
        <Link to="/" className="logo" aria-label="Gadget Hub — главная">
          <BrandMark />
        </Link>
        <nav aria-label="Основная навигация">
          <NavLink to="/catalog" className="nav">
            <Icon name="grid" />
            Каталог
          </NavLink>
          {user && (
            <NavLink to="/cart" className="nav">
              <Icon name="cart" />
              Корзина
              <span className="badge" aria-label={`${count} товаров в корзине`}>
                {count}
              </span>
            </NavLink>
          )}
          {user ? (
            <button
              className="nav"
              onClick={logout}
              disabled={busy}
              title={`Вы вошли как ${user.username}`}
            >
              <Icon name="logout" />
              Выйти
            </button>
          ) : (
            <NavLink to="/login" className="nav">
              <Icon name="user" />
              Войти
            </NavLink>
          )}
        </nav>
        {error && (
          <Modal onClose={() => setError('')} title="Не удалось выйти">
            <p>{error}</p>
          </Modal>
        )}
      </div>
    </header>
  );
}
function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-grid">
        <div>
          <Link to="/" className="logo" aria-label="Gadget Hub">
            <BrandMark monochrome />
          </Link>
          <p>Магазин надежных гаджетов</p>
        </div>
        <a className="footer-phone" href="tel:88006783424">
          <Icon name="phone" />8 (800) 678-34-24
        </a>
        <div className="socials">
          <a
            href="https://vk.com"
            target="_blank"
            rel="noreferrer"
            aria-label="ВКонтакте"
          >
            <img src="/images/vk.webp" alt="" />
          </a>
          <a
            href="https://t.me"
            target="_blank"
            rel="noreferrer"
            aria-label="Telegram"
          >
            <img src="/images/telegram.webp" alt="" />
          </a>
          <a
            href="https://www.whatsapp.com"
            target="_blank"
            rel="noreferrer"
            aria-label="WhatsApp"
          >
            <img src="/images/whatsapp.webp" alt="" />
          </a>
        </div>
        <p className="copyright">© 2024 ООО «Гаджет Хаб». Все права защищены</p>
      </div>
    </footer>
  );
}
function Protected({children}) {
  const {user} = useApp();
  return user ? children : <Navigate to="/login" replace />;
}
function Store({user, setUser}) {
  const cart = useCart(user?.username);
  const [goods, setGoods] = useState([]);
  const [goodsState, setGoodsState] = useState('loading');
  const [error, setError] = useState('');
  const location = useLocation();
  const loadGoods = async () => {
    setGoodsState('loading');
    try {
      setGoods(await api.goods());
      setGoodsState('ready');
    } catch (e) {
      setError(e.message);
      setGoodsState('error');
    }
  };
  useEffect(() => {
    loadGoods();
  }, []);
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);
  const loading = goodsState === 'loading';
  return (
    <Ctx.Provider value={{user, setUser, goods, ...cart}}>
      <a className="skip-link" href="#content">
        К содержимому
      </a>
      <Header />
      <main
        id="content"
        className={
          location.pathname === '/login' ? 'main login-main' : 'container main'
        }
      >
        {cart.storageError && (
          <p className="notice" role="status">
            {cart.storageError}
          </p>
        )}
        {location.pathname !== '/login' && goodsState !== 'ready' ? (
          <div className="empty" role="status">
            {loading ? (
              <>
                <span className="spinner" />
                Загружаем товары…
              </>
            ) : (
              <>
                <h2>Не удалось загрузить магазин</h2>
                <p>{error}</p>
                <button className="btn" onClick={loadGoods}>
                  Повторить
                </button>
              </>
            )}
          </div>
        ) : (
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route
              path="/catalog"
              element={
                <Protected>
                  <Catalog />
                </Protected>
              }
            />
            <Route
              path="/cart"
              element={
                <Protected>
                  <Cart />
                </Protected>
              }
            />
            <Route
              path="*"
              element={
                <div className="empty">
                  <h1>Страница не найдена</h1>
                  <Link className="btn" to="/">
                    На главную
                  </Link>
                </div>
              }
            />
          </Routes>
        )}
      </main>
      <Footer />
    </Ctx.Provider>
  );
}
export default function App() {
  const [user, setUser] = useState(null);
  const [state, setState] = useState('loading');
  const [error, setError] = useState('');
  const load = async () => {
    setState('loading');
    try {
      setUser(await api.me());
      setState('ready');
    } catch (e) {
      if (e.status === 401) {
        setUser(null);
        setState('ready');
      } else {
        setError(e.message);
        setState('error');
      }
    }
  };
  useEffect(() => {
    load();
    const expire = () => setUser(null);
    window.addEventListener('session-expired', expire);
    return () => window.removeEventListener('session-expired', expire);
  }, []);
  if (state !== 'ready') {
    return (
      <div className="startup empty" role="status">
        <Link to="/" className="logo" aria-label="Gadget Hub">
          <BrandMark />
        </Link>
        {state === 'loading' ? (
          <p>Загружаем магазин…</p>
        ) : (
          <>
            <p>{error}</p>
            <button className="btn" onClick={load}>
              Повторить
            </button>
          </>
        )}
      </div>
    );
  }
  return <Store key={user?.id || 'guest'} user={user} setUser={setUser} />;
}
