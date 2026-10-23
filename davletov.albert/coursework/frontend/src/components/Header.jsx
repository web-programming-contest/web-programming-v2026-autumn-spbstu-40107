import { Link, NavLink, useNavigate } from 'react-router'
import { useAuth } from '../context/AuthContext.jsx'
import { useCart } from '../context/CartContext.jsx'
import './Header.css'

function Header() {
  const { user, logout } = useAuth()
  const { count } = useCart()
  const navigate = useNavigate()

  const handleLogout = async () => {
    navigate('/')
    await logout()
  }

  return (
    <header className="header">
      <div className="container header__inner">
        <Link to="/" className="header__logo">
          <span className="header__logo-accent">Gadget</span> Hub
        </Link>

        <nav className="header__menu">
          <NavLink to="/catalog" className="header__link">
            <img src="/images/icons/catalog.svg" alt="" />
            Каталог
          </NavLink>

          {user ? (
            <>
              <NavLink to="/cart" className="header__link">
                <img src="/images/icons/card.svg" alt="" />
                Корзина
                {count > 0 && <span className="header__badge">{count}</span>}
              </NavLink>
              <button type="button" className="header__link" onClick={handleLogout}>
                <img src="/images/icons/profile.svg" alt="" />
                Выйти
              </button>
            </>
          ) : (
            <NavLink to="/login" className="header__link">
              <img src="/images/icons/profile.svg" alt="" />
              Войти
            </NavLink>
          )}
        </nav>
      </div>
    </header>
  )
}

export default Header
