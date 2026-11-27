import {useEffect, useState} from 'react';
import {api} from './api.js';

export default function useGoods() {
  const [goods, setGoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError('');
    async function load() {
      try {
        const items = await api('/goods', {signal: controller.signal});
        if (!Array.isArray(items)) throw new Error('Сервер вернул неверный список товаров.');
        setGoods(items);
      } catch (err) {
        if (err.name !== 'AbortError') setError(err.message);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    load();
    return () => controller.abort();
  }, [attempt]);

  return {goods, loading, error, retry: () => setAttempt((current) => current + 1)};
}
