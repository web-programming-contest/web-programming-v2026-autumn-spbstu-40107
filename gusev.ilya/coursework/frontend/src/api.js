async function request(path, options = {}) {
  let response;
  try {
    response = await fetch(`/api${path}`, {
      credentials: 'include',
      ...options,
      headers: {'Content-Type': 'application/json', ...options.headers},
    });
  } catch {
    throw new Error(
      'Нет соединения с сервером. Проверьте подключение и попробуйте ещё раз.',
    );
  }
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    if (response.status === 401 && path !== '/login' && path !== '/me') {
      window.dispatchEvent(new Event('session-expired'));
    }
    throw Object.assign(new Error(data.message || 'Ошибка запроса'), {
      status: response.status,
      errors: data.errors,
    });
  }
  return data;
}
const post = (path, body = {}) =>
  request(path, {method: 'POST', body: JSON.stringify(body)});
export const api = {
  me: () => request('/me'),
  login: (body) => post('/login', body),
  logout: () => post('/logout'),
  goods: () => request('/goods'),
  orders: () => request('/orders'),
  order: (body) => post('/orders', body),
};
