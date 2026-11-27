export async function api(path, {method = 'GET', body, signal} = {}) {
  let response;
  try {
    response = await fetch(`/api${path}`, {
      method, signal,
      credentials: 'include',
      headers: body === undefined ? {} : {'Content-Type': 'application/json'},
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch (error) {
    if (error.name === 'AbortError') throw error;
    throw new Error('Нет связи с сервером. Проверьте, что он запущен, и попробуйте ещё раз.');
  }
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(data.message || 'Не удалось выполнить запрос. Попробуйте ещё раз.');
    error.status = response.status;
    error.fieldErrors = data.fieldErrors || {};
    throw error;
  }
  return data;
}
