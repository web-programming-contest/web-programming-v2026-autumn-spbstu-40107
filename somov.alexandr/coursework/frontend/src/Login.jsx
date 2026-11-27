import {useState} from 'react';
import {Navigate, useNavigate} from 'react-router-dom';
import {useAuth} from './context/AuthContext.jsx';
import Field from './components/Field.jsx';
import Modal from './components/Modal.jsx';

export default function Login() {
  const auth = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({login: '', password: ''});
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  if (auth.user) return <Navigate to="/" replace />;

  async function submit(event) {
    event.preventDefault();
    const nextErrors = {};
    if (!form.login.trim()) nextErrors.login = 'Заполните обязательное поле.';
    if (!form.password.trim()) nextErrors.password = 'Заполните обязательное поле.';
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length || sending) return;
    setSending(true);
    try {
      await auth.login(form);
      navigate('/', {replace: true});
    } catch (error) {
      setErrors(error.fieldErrors || {});
      setMessage(error.message);
    } finally {
      setSending(false);
    }
  }

  return (
    <section className="login-page login-background">
      <h1>Добро пожаловать!</h1>
      <form className="login-form" onSubmit={submit} noValidate>
        <Field id="login" label="Логин" name="login" autoComplete="username" required value={form.login} onChange={(event) => setForm({...form, login: event.target.value})} error={errors.login} />
        <Field id="password" label="Пароль" name="password" type="password" autoComplete="current-password" required value={form.password} onChange={(event) => setForm({...form, password: event.target.value})} error={errors.password} />
        <button className="button" type="submit" disabled={sending || auth.loading}>{sending ? 'Входим…' : 'Войти'}</button>
      </form>
      {message && <Modal title="Не удалось войти" onClose={() => setMessage('')}><p role="alert">{message}</p><div className="modal-actions"><button className="button" onClick={() => setMessage('')}>Понятно</button></div></Modal>}
    </section>
  );
}
