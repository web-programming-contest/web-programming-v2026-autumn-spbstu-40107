import {useEffect, useState} from 'react';
import {api} from '../api.js';
import {formatPrice} from '../catalog.js';
import {useAuth} from '../context/AuthContext.jsx';

export default function OrderHistory() {
  const auth = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError('');
    api('/orders', {signal: controller.signal})
      .then(setOrders)
      .catch((err) => {
        if (err.name === 'AbortError') return;
        setError(err.message);
        if (err.status === 401) auth.refresh();
      })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [attempt]);

  if (loading) return <p className="history-status" role="status">Загружаем историю заказов…</p>;
  if (error) return <div className="history-status" role="alert"><p>{error}</p><button className="button" onClick={() => setAttempt((value) => value + 1)}>Попробовать снова</button></div>;
  if (!orders.length) return <p className="history-status">Вы пока не оформляли заказы.</p>;

  return <div className="history-panel"><table className="order-table"><caption className="visually-hidden">Предыдущие заказы</caption><thead><tr><th scope="col">Заказ и дата</th><th scope="col">Товаров</th><th scope="col">Сумма</th></tr></thead><tbody>{orders.map((order) => <tr key={order.id}><td>№ {order.id} от {new Date(order.createdAt).toLocaleDateString('ru-RU')}</td><td>{order.totalQuantity}</td><td>{formatPrice(order.totalPrice)}</td></tr>)}</tbody></table></div>;
}
