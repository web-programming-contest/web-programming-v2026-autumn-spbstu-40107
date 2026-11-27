import { useApp } from '../context/AppContext';

export default function Login() {
  const {
    loginUsername,
    setLoginUsername,
    loginPassword,
    setLoginPassword,
    loginErrors,
    setLoginErrors,
    handleLoginSubmit
  } = useApp();

  return (
    <div className="login-page-bg">
      <div className="login-box">
        <h2>Добро пожаловать!</h2>
        <form onSubmit={handleLoginSubmit} noValidate>
          <div className="form-field">
            <label>
              Логин <span className="req">*</span>
            </label>
            <input
              type="text"
              value={loginUsername}
              onChange={(event) => {
                setLoginUsername(event.target.value);
                setLoginErrors((prev) => ({ ...prev, username: false }));
              }}
              className={loginErrors.username ? 'input-error' : ''}
              placeholder="Введите логин"
            />
            {loginErrors.username && (
              <span className="error-text">Заполните обязательное поле</span>
            )}
          </div>

          <div className="form-field">
            <label>
              Пароль <span className="req">*</span>
            </label>
            <input
              type="password"
              value={loginPassword}
              onChange={(event) => {
                setLoginPassword(event.target.value);
                setLoginErrors((prev) => ({ ...prev, password: false }));
              }}
              className={loginErrors.password ? 'input-error' : ''}
              placeholder="Введите пароль"
            />
            {loginErrors.password && (
              <span className="error-text">Заполните обязательное поле</span>
            )}
          </div>

          <button type="submit" className="btn-blue">
            Войти
          </button>
        </form>
        <p className="login-hint">Тестовые аккаунты: admin / 123, user1 / 123, user2 / 123</p>
      </div>
    </div>
  );
}
