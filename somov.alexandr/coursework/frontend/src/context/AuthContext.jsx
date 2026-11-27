import {createContext, useContext, useEffect, useState} from 'react';
import {api} from '../api.js';

const AuthContext = createContext(null);

export function AuthProvider({children}) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function refresh(signal) {
    setLoading(true);
    setError('');
    try {
      const data = await api('/session', {signal});
      setUser(data.user);
    } catch (err) {
      if (err.name !== 'AbortError') setError(err.message);
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }

  useEffect(() => {
    const controller = new AbortController();
    refresh(controller.signal);
    return () => controller.abort();
  }, []);

  async function login(form) {
    const data = await api('/login', {method: 'POST', body: form});
    setUser(data.user);
    setError('');
  }

  async function logout() {
    try {
      await api('/logout', {method: 'POST'});
      setUser(null);
      setError('');
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    }
  }

  return <AuthContext.Provider value={{user, loading, error, refresh, login, logout}}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
