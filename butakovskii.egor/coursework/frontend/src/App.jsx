import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  NavLink,
  Link,
} from 'react-router-dom';
import {useState, useEffect} from 'react';
import Login from './pages/Login';
import Catalog from './pages/Catalog';
import Cart from './pages/Cart';
import Home from './pages/Home';

const Layout = ({children, isAuth, setAuth}) => {
  const cartItems = JSON.parse(localStorage.getItem('cart') || '{}');
  const cartCount = Object.values(cartItems).reduce(
    (sum, count) => sum + count,
    0,
  );

  const navLinkStyle = ({isActive}) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    color: isActive ? 'var(--primary-blue)' : '#333',
    fontWeight: isActive ? '700' : '500',
    textDecoration: 'none',
  });

  return (
    <div style={{display: 'flex', flexDirection: 'column', minHeight: '100vh'}}>
      <header style={{padding: '20px 0', borderBottom: '1px solid #eee'}}>
        <div
          className="container"
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Link to="/" style={{fontSize: '24px', fontWeight: 'bold'}}>
            <span style={{color: 'var(--primary-blue)'}}>Gadget</span> Hub
          </Link>
          <nav
            style={{
              display: 'flex',
              gap: '30px',
              alignItems: 'center',
              fontSize: '14px',
            }}
          >
            <NavLink to="/catalog" style={navLinkStyle}>
              <img src="/catalog.svg" alt="" width="16" /> Каталог
            </NavLink>
            {isAuth ? (
              <>
                <NavLink to="/cart" style={navLinkStyle}>
                  <img src="/card.svg" alt="" width="16" /> Корзина
                  {cartCount > 0 && (
                    <span
                      style={{
                        background: 'var(--pink-accent)',
                        color: '#fff',
                        borderRadius: '50%',
                        padding: '2px 6px',
                        fontSize: '12px',
                      }}
                    >
                      {cartCount}
                    </span>
                  )}
                </NavLink>
                <button
                  onClick={async () => {
                    await fetch('/api/logout', {method: 'POST'});
                    setAuth(false);
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'var(--primary-blue)',
                    fontWeight: '500',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  <img src="/profile.svg" alt="" width="16" /> Выйти
                </button>
              </>
            ) : (
              <NavLink to="/login" style={navLinkStyle}>
                <img src="/profile.svg" alt="" width="16" /> Войти
              </NavLink>
            )}
          </nav>
        </div>
      </header>

      <main style={{flex: 1, display: 'flex', flexDirection: 'column'}}>
        {children}
      </main>

      <footer
        style={{
          background: 'var(--footer-bg)',
          color: '#fff',
          padding: '40px 0',
          marginTop: 'auto',
        }}
      >
        <div
          className="container"
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div>
            <h3 style={{margin: '0 0 5px 0', fontSize: '18px'}}>Gadget Hub</h3>
            <p style={{margin: 0, fontSize: '12px', opacity: 0.7}}>
              Магазин надежных гаджетов
            </p>
            <p style={{margin: '20px 0 0 0', fontSize: '12px', opacity: 0.5}}>
              © 2024 ООО "Гаджет Хаб". Все права защищены
            </p>
          </div>
          <div style={{display: 'flex', alignItems: 'center', gap: '50px'}}>
            <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
              <img
                src="/mobile.svg"
                alt=""
                width="16"
                style={{filter: 'brightness(0) invert(1)'}}
              />
              <span style={{fontWeight: '500'}}>8 (800) 678-34-24</span>
            </div>
            <div style={{display: 'flex', gap: '15px'}}>
              <img src="/vk.png" alt="VK" width="24" />
              <img src="/telegram.png" alt="TG" width="24" />
              <img src="/whatsapp.png" alt="WA" width="24" />
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

const ProtectedRoute = ({isAuth, children}) =>
  isAuth ? children : <Navigate to="/login" replace />;

export default function App() {
  const [isAuth, setIsAuth] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [cartUpdate, setCartUpdate] = useState(0);

  useEffect(() => {
    fetch('/api/check-auth')
      .then((r) => r.json())
      .then((data) => {
        setIsAuth(data.isAuth);
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    const handleStorage = () => setCartUpdate((prev) => prev + 1);
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  if (isLoading) return null;

  return (
    <BrowserRouter>
      <Layout isAuth={isAuth} setAuth={setIsAuth}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login setAuth={setIsAuth} />} />
          <Route
            path="/catalog"
            element={
              <ProtectedRoute isAuth={isAuth}>
                <Catalog />
              </ProtectedRoute>
            }
          />
          <Route
            path="/cart"
            element={
              <ProtectedRoute isAuth={isAuth}>
                <Cart />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}
