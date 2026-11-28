import {useState} from 'react';
import {Navigate, useNavigate} from 'react-router-dom';
import {useApp} from '../ctx.js';
import {api} from '../api.js';
import {Field, Modal} from '../ui.jsx';
export default function Login() {
  const {user, setUser} = useApp();
  const navigate = useNavigate();
  const [form, setForm] = useState({username: '', password: ''});
  const [errors, setErrors] = useState({});
  const [popup, setPopup] = useState('');
  const [busy, setBusy] = useState(false);
  if (user) {
    return <Navigate to="/" replace />;
  }
  const change = (key, value) => {
    setForm({...form, [key]: value});
    setErrors({...errors, [key]: ''});
  };
  const submit = async (event) => {
    event.preventDefault();
    if (busy) {
      return;
    }
    const next = {};
    if (!form.username.trim()) {
      next.username = 'Заполните обязательное поле';
    }
    if (!form.password) {
      next.password = 'Заполните обязательное поле';
    }
    setErrors(next);
    if (Object.keys(next).length) {
      return;
    }
    setBusy(true);
    try {
      const account = await api.login({
        ...form,
        username: form.username.trim(),
      });
      navigate('/', {replace: true});
      setUser(account);
    } catch (e) {
      setPopup(e.message);
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className="login-scene">
      <div className="login-wrap">
        <h1>Добро пожаловать!</h1>
        <form className="login-box" onSubmit={submit} noValidate>
          <Field
            label="Логин"
            required
            autoComplete="username"
            maxLength={100}
            value={form.username}
            error={errors.username}
            onChange={(e) => change('username', e.target.value)}
          />
          <Field
            label="Пароль"
            required
            type="password"
            autoComplete="current-password"
            maxLength={200}
            value={form.password}
            error={errors.password}
            onChange={(e) => change('password', e.target.value)}
          />
          <button className="btn" type="submit" disabled={busy}>
            {busy ? 'Входим…' : 'Войти'}
          </button>
        </form>
      </div>
      {popup && (
        <Modal title="Не удалось войти" onClose={() => setPopup('')}>
          <p>{popup}</p>
          <button className="btn" onClick={() => setPopup('')}>
            Понятно
          </button>
        </Modal>
      )}
    </div>
  );
}
