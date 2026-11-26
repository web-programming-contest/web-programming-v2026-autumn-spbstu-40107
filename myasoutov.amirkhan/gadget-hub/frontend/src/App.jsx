import { Link, Navigate, NavLink, Route, Routes, useLocation } from 'react-router-dom';
import Modals from './components/Modals';
import { PAGE_PATHS } from './constants';
import { useApp } from './context/AppContext';
import Cart from './pages/Cart';
import Catalog from './pages/Catalog';
import Home from './pages/Home';
import Login from './pages/Login';

function ProtectedRoute({ children }) {
  const { user, authChecking } = useApp();
  const location = useLocation();

  if (authChecking) {
    return <div className="container auth-checking">Проверяем авторизацию…</div>;
  }

  if (!user) {
    return <Navigate to={PAGE_PATHS.login} replace state={{ from: location.pathname }} />;
  }

  return children;
}

function Header() {
  const { user, totalCartItemsCount, navigateTo, handleLogout } = useApp();

  const handleLinkClick = (event, page) => {
    event.preventDefault();
    navigateTo(page);
  };

  const navClass = ({ isActive }) => `nav-btn ${isActive ? 'active' : ''}`;

  return (
    <header className="site-header">
      <div className="container header-inner">
        <Link
          to={PAGE_PATHS.home}
          className="logo logo--clickable"
          onClick={(event) => handleLinkClick(event, 'home')}
        >
          <span className="logo-text">Gadget Hub</span>
        </Link>

        <nav className="header-nav">
          <NavLink
            to={PAGE_PATHS.catalog}
            className={navClass}
            onClick={(event) => handleLinkClick(event, 'catalog')}
          >
            <img src="/icons/catalog.svg" alt="" className="nav-icon" /> Каталог
          </NavLink>

          {user && <span className="user-name">{user}</span>}

          {user && (
            <NavLink
              to={PAGE_PATHS.cart}
              className={navClass}
              onClick={(event) => handleLinkClick(event, 'cart')}
            >
              <img src="/icons/card.svg" alt="" className="nav-icon" /> Корзина
              {totalCartItemsCount > 0 && (
                <span className="cart-badge">{totalCartItemsCount}</span>
              )}
            </NavLink>
          )}

          {!user ? (
            <NavLink
              to={PAGE_PATHS.login}
              className={navClass}
              onClick={(event) => handleLinkClick(event, 'login')}
            >
              <img src="/icons/profile.svg" alt="" className="nav-icon" /> Войти
            </NavLink>
          ) : (
            <button type="button" className="nav-btn" onClick={handleLogout}>
              <img src="/icons/profile.svg" alt="" className="nav-icon" /> Выйти
            </button>
          )}
        </nav>
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-inner">
        <div>
          <div className="logo-text">Gadget Hub</div>
          <p className="footer-sub">Магазин надежных гаджетов</p>
          <p className="footer-copy">© 2024 ООО «Гаджет Хаб». Все права защищены</p>
        </div>
        <div className="footer-contacts">
          <span className="footer-phone">8 (800) 678-34-24</span>
          <div className="social-links">
            <a
              href="https://vk.com"
              target="_blank"
              rel="noreferrer"
              className="social-circle"
              aria-label="ВКонтакте"
            >
              <img src="/social%20icons/vk.png" alt="" className="social-icon" />
            </a>
            <a
              href="https://t.me"
              target="_blank"
              rel="noreferrer"
              className="social-circle"
              aria-label="Telegram"
            >
              <img src="/social%20icons/telegram.png" alt="" className="social-icon" />
            </a>
            <a
              href="https://whatsapp.com"
              target="_blank"
              rel="noreferrer"
              className="social-circle"
              aria-label="WhatsApp"
            >
              <img src="/social%20icons/whatsapp.png" alt="" className="social-icon" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default function App() {
  return (
    <div className="site-wrapper">
      <Header />
      <main className="main-content">
        <Routes>
          <Route path={PAGE_PATHS.home} element={<Home />} />
          <Route path={PAGE_PATHS.login} element={<Login />} />
          <Route
            path={PAGE_PATHS.catalog}
            element={
              <ProtectedRoute>
                <Catalog />
              </ProtectedRoute>
            }
          />
          <Route
            path={PAGE_PATHS.cart}
            element={
              <ProtectedRoute>
                <Cart />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to={PAGE_PATHS.home} replace />} />
        </Routes>
      </main>
      <Footer />
      <Modals />
    </div>
  );
}
