import {Link, NavLink} from 'react-router-dom';
import {useCart} from '../context/CartContext.jsx';
import Icon from './Icon.jsx';

export function Header({user, onLogout}) {
  const {totalQuantity} = useCart();
  return (
    <header className="site-header">
      <div className="container header-inner">
        <Link className="logo" to="/" aria-label="Gadget Hub — главная"><span>Gadget</span> Hub</Link>
        <nav className="header-nav" aria-label="Основная навигация">
          <NavLink className="nav-link" to="/catalog"><Icon name="grid" />Каталог</NavLink>
          {user && (
            <NavLink className="nav-link" to="/cart">
              <Icon name="cart" />Корзина
              {totalQuantity > 0 && <span className="cart-badge" aria-label={`${totalQuantity} товаров в корзине`}>{totalQuantity}</span>}
            </NavLink>
          )}
          {user ? <button className="nav-link" onClick={onLogout}><Icon name="user" />Выйти</button>
            : <NavLink className="nav-link" to="/login"><Icon name="user" />Войти</NavLink>}
        </nav>
      </div>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-inner">
        <div><Link className="logo" to="/">Gadget Hub</Link><p className="footer-caption">Магазин надёжных гаджетов</p><p className="copyright">© 2024 ООО «Гаджет Хаб». Все права защищены</p></div>
        <a className="footer-phone" href="tel:88006783424"><Icon name="phone" />8 (800) 678-34-24</a>
        <div className="social-links" aria-label="Социальные сети">
          <a href="https://vk.com/" aria-label="ВКонтакте"><img src="/assets/icons/vk.png" alt="" /></a>
          <a href="https://t.me/" aria-label="Telegram"><img src="/assets/icons/telegram.png" alt="" /></a>
          <a href="https://www.whatsapp.com/" aria-label="WhatsApp"><img src="/assets/icons/whatsapp.png" alt="" /></a>
        </div>
      </div>
    </footer>
  );
}
