import React, {useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {API_URL} from '../App';

function Login({onLogin}) {
  const [loginValue, setLoginValue] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [authModalError, setAuthModalError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = {};

    if (!loginValue.trim()) {
      validationErrors.login = 'Заполните обязательное поле';
    }
    if (!password.trim()) {
      validationErrors.password = 'Заполните обязательное поле';
    }

    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    try {
      const res = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          login: loginValue,
          username: loginValue,
          password,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setAuthModalError(
          data.error ||
            'Такого пользователя нет, возможно неправильный логин или пароль, проверьте данные',
        );
        return;
      }

      onLogin(data.user || {login: loginValue});
      navigate('/');
    } catch {
      setAuthModalError(
        'Такого пользователя нет, возможно неправильный логин или пароль, проверьте данные',
      );
    }
  };

  return (
    <div className="login-page">
      <div className="login-center">
        <h1 className="login-heading">Добро пожаловать!</h1>

        <form className="login-card" onSubmit={handleSubmit} noValidate>
          <div className="form-field">
            <label className="field-label">
              Логин <span className="req-star">*</span>
            </label>
            <input
              type="text"
              className={`text-input ${errors.login ? 'input-error' : ''}`}
              value={loginValue}
              onChange={(e) => {
                setLoginValue(e.target.value);
                if (errors.login) {
                  setErrors({...errors, login: null});
                }
              }}
            />
            {errors.login && <span className="error-text">{errors.login}</span>}
          </div>

          <div className="form-field">
            <label className="field-label">
              Пароль <span className="req-star">*</span>
            </label>
            <input
              type="password"
              className={`text-input ${errors.password ? 'input-error' : ''}`}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (errors.password) {
                  setErrors({...errors, password: null});
                }
              }}
            />
            {errors.password && (
              <span className="error-text">{errors.password}</span>
            )}
          </div>

          <button type="submit" className="btn btn-blue">
            Войти
          </button>
        </form>
      </div>

      {authModalError && (
        <div className="modal-overlay" onClick={() => setAuthModalError('')}>
          <div
            className="modal-window dialog-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="modal-close"
              onClick={() => setAuthModalError('')}
            >
              ✕
            </button>
            <h3 className="dialog-title">Ошибка входа</h3>
            <p className="dialog-text">{authModalError}</p>
            <div className="dialog-actions">
              <button
                type="button"
                className="btn btn-blue"
                onClick={() => setAuthModalError('')}
              >
                Понятно
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Login;
