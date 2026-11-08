import React from 'react';
import {Link, useLocation, useNavigate} from 'react-router-dom';

function Header({user, onLogout, cartCount}) {
  const location = useLocation();
  const navigate = useNavigate();

  const isCatalog = location.pathname === '/catalog';
  const isCart = location.pathname === '/cart';

  const handleLogoutClick = () => {
    onLogout();
    navigate('/');
  };

  return (
    <header className="site-header">
      <div className="container header-inner">
        <Link to="/" className="logo">
          Gadget Hub
        </Link>

        <nav className="header-nav">
          <Link
            to="/catalog"
            className={`nav-link ${isCatalog ? 'active' : ''}`}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <rect x="3" y="3" width="7" height="7" rx="1" />
              <rect x="14" y="3" width="7" height="7" rx="1" />
              <rect x="14" y="14" width="7" height="7" rx="1" />
              <rect x="3" y="14" width="7" height="7" rx="1" />
            </svg>
            <span>Каталог</span>
          </Link>

          {user && (
            <Link to="/cart" className={`nav-link ${isCart ? 'active' : ''}`}>
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="9" cy="21" r="1" />
                <circle cx="20" cy="21" r="1" />
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
              </svg>
              <span>Корзина</span>
              {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
            </Link>
          )}

          {user ? (
            <button
              type="button"
              className="nav-link nav-btn"
              onClick={handleLogoutClick}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              <span>Выйти</span>
            </button>
          ) : (
            <Link
              to="/login"
              className={`nav-link ${location.pathname === '/login' ? 'active' : ''}`}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                <polyline points="10 17 15 12 10 7" />
                <line x1="15" y1="12" x2="3" y2="12" />
              </svg>
              <span>Войти</span>
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}

export default Header;
