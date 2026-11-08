import React, {useState, useEffect} from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import Catalog from './pages/Catalog';
import Cart from './pages/Cart';
import Login from './pages/Login';
import ProductModal from './components/ProductModal';

export const API_URL = 'http://localhost:8080';

function App() {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('gadget_hub_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [cart, setCart] = useState(() => {
    const savedCart = localStorage.getItem('gadget_hub_cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });

  const [goods, setGoods] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);

  useEffect(() => {
    fetch(`${API_URL}/goods`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setGoods(data);
        }
      })
      .catch((err) => console.error('Ошибка загрузки товаров:', err));
  }, []);

  useEffect(() => {
    localStorage.setItem('gadget_hub_cart', JSON.stringify(cart));
  }, [cart]);

  const handleLoginSuccess = (userData) => {
    setUser(userData);
    localStorage.setItem('gadget_hub_user', JSON.stringify(userData));
  };

  const handleLogout = async () => {
    try {
      await fetch(`${API_URL}/logout`, {method: 'POST'});
    } catch {
      console.warn('Ошибка при выходе из системы');
    }
    setUser(null);
    localStorage.removeItem('gadget_hub_user');
  };

  const addToCart = (product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id
            ? {...item, quantity: item.quantity + 1}
            : item,
        );
      }
      return [...prev, {...product, quantity: 1}];
    });
  };

  const updateCartQuantity = (productId, delta) => {
    setCart((prev) =>
      prev
        .map((item) =>
          item.id === productId
            ? {...item, quantity: item.quantity + delta}
            : item,
        )
        .filter((item) => item.quantity > 0),
    );
  };

  const removeFromCart = (productIds) => {
    const idsArray = Array.isArray(productIds) ? productIds : [productIds];
    setCart((prev) => prev.filter((item) => !idsArray.includes(item.id)));
  };

  const clearCart = () => {
    setCart([]);
    localStorage.removeItem('gadget_hub_cart');
  };

  const totalCartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <Router>
      <div className="app-wrapper">
        <Header
          user={user}
          onLogout={handleLogout}
          cartCount={totalCartCount}
        />
        <main className="main-content">
          <Routes>
            <Route
              path="/"
              element={
                <Home
                  goods={goods}
                  cart={cart}
                  onAddToCart={addToCart}
                  onUpdateQuantity={updateCartQuantity}
                  onOpenModal={setSelectedProduct}
                  user={user}
                />
              }
            />
            <Route
              path="/login"
              element={
                user ? (
                  <Navigate to="/" replace />
                ) : (
                  <Login onLogin={handleLoginSuccess} />
                )
              }
            />
            <Route
              path="/catalog"
              element={
                user ? (
                  <Catalog
                    goods={goods}
                    cart={cart}
                    onAddToCart={addToCart}
                    onUpdateQuantity={updateCartQuantity}
                    onOpenModal={setSelectedProduct}
                  />
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />
            <Route
              path="/cart"
              element={
                user ? (
                  <Cart
                    cart={cart}
                    onUpdateQuantity={updateCartQuantity}
                    onRemoveFromCart={removeFromCart}
                    onClearCart={clearCart}
                    onOpenModal={setSelectedProduct}
                  />
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        <Footer />

        {selectedProduct && (
          <ProductModal
            product={selectedProduct}
            cartItem={cart.find((item) => item.id === selectedProduct.id)}
            onClose={() => setSelectedProduct(null)}
            onAddToCart={addToCart}
            onUpdateQuantity={updateCartQuantity}
          />
        )}
      </div>
    </Router>
  );
}

export default App;
