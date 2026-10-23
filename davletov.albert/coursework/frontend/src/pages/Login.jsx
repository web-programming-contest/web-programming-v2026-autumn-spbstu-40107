import { useState } from 'react'
import { useNavigate } from 'react-router'
import { useAuth } from '../context/AuthContext.jsx'
import Input from '../components/Input.jsx'
import Button from '../components/Button.jsx'
import Modal from '../components/Modal.jsx'
import './Login.css'

const REQUIRED = 'Заполните обязательное поле'

function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState({})
  const [serverError, setServerError] = useState('')

  const handleSubmit = async (event) => {
    event.preventDefault()

    const newErrors = {}
    if (!username.trim()) {
      newErrors.username = REQUIRED
    }
    if (!password) {
      newErrors.password = REQUIRED
    }
    setErrors(newErrors)
    if (Object.keys(newErrors).length > 0) {
      return
    }

    try {
      await login(username.trim(), password)
      navigate('/')
    } catch (error) {
      setServerError(error.message)
    }
  }

  return (
    <div className="login">
      <h1 className="title login__title">Добро пожаловать!</h1>
      <form className="login__form" onSubmit={handleSubmit} noValidate>
        <Input
          label="Логин"
          required
          value={username}
          onChange={(event) => setUsername(event.target.value)}
          error={errors.username}
        />
        <Input
          label="Пароль"
          type="password"
          required
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          error={errors.password}
        />
        <Button type="submit" className="login__button">
          Войти
        </Button>
      </form>

      {serverError && (
        <Modal onClose={() => setServerError('')}>
          <p className="login__error">{serverError}</p>
          <Button onClick={() => setServerError('')}>Ок</Button>
        </Modal>
      )}
    </div>
  )
}

export default Login
