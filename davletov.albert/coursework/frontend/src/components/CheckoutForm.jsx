import { useState } from 'react'
import { createOrder } from '../api.js'
import { useCart } from '../context/CartContext.jsx'
import Button from './Button.jsx'
import Checkbox from './Checkbox.jsx'
import Input from './Input.jsx'
import Radio from './Radio.jsx'
import Select from './Select.jsx'
import './CheckoutForm.css'

const REQUIRED = 'Заполните обязательное поле'
const PHONE_DIGITS = 11
const NOT_PHONE_CHARS = /[^\d+\-()\s]/g

const countDigits = (text) => text.replace(/\D/g, '').length

const PAYMENTS = [
  { value: 'card', label: 'По карте' },
  { value: 'cash', label: 'Наличными' },
]

const EMPTY_FORM = {
  email: '',
  phone: '',
  delivery: 'pickup',
  address: '',
  payment: '',
  packaging: false,
}

function CheckoutForm({ onSuccess }) {
  const { items, clear } = useCart()
  const [form, setForm] = useState(EMPTY_FORM)
  const [errors, setErrors] = useState({})
  const [serverError, setServerError] = useState('')
  const [sending, setSending] = useState(false)

  const setField = (name, value) => setForm({ ...form, [name]: value })

  const validate = () => {
    const newErrors = {}
    if (!form.phone.trim()) {
      newErrors.phone = REQUIRED
    } else if (countDigits(form.phone) !== PHONE_DIGITS) {
      newErrors.phone = `Введите номер полностью: ${PHONE_DIGITS} цифр`
    }
    if (form.delivery === 'delivery' && !form.address.trim()) {
      newErrors.address = REQUIRED
    }
    if (!form.payment) {
      newErrors.payment = REQUIRED
    }
    return newErrors
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    const newErrors = validate()
    setErrors(newErrors)
    if (Object.keys(newErrors).length > 0) {
      return
    }

    setSending(true)
    setServerError('')
    try {
      const order = await createOrder({
        ...form,
        items: items.map((item) => ({ id: item.id, quantity: item.quantity })),
      })
      clear()
      setForm(EMPTY_FORM)
      onSuccess(order.id)
    } catch (error) {
      setServerError(error.message)
    } finally {
      setSending(false)
    }
  }

  return (
    <section className="checkout">
      <h2 className="title checkout__title">Оформление заказа</h2>

      <form className="panel checkout__form" onSubmit={handleSubmit} noValidate>
        <div className="checkout__row">
          <Input
            label="Телефон"
            type="tel"
            required
            placeholder="+7 (900) 000-00-00"
            maxLength={18}
            value={form.phone}
            onChange={(event) => setField('phone', event.target.value.replace(NOT_PHONE_CHARS, ''))}
            error={errors.phone}
          />
          <Input
            label="E-mail"
            type="email"
            placeholder="mail@example.ru"
            value={form.email}
            onChange={(event) => setField('email', event.target.value)}
          />
        </div>

        <div className="checkout__radios">
          <Radio
            name="delivery"
            label="Самовывоз"
            checked={form.delivery === 'pickup'}
            onChange={() => setField('delivery', 'pickup')}
          />
          <Radio
            name="delivery"
            label="Доставка"
            checked={form.delivery === 'delivery'}
            onChange={() => setField('delivery', 'delivery')}
          />
        </div>

        {form.delivery === 'delivery' && (
          <Input
            label="Адрес доставки"
            required
            className="checkout__address"
            placeholder="Город, улица, дом, квартира"
            value={form.address}
            onChange={(event) => setField('address', event.target.value)}
            error={errors.address}
          />
        )}

        <Select
          label="Способ оплаты"
          required
          className="checkout__payment"
          placeholder="Не выбрано"
          options={PAYMENTS}
          value={form.payment}
          onChange={(event) => setField('payment', event.target.value)}
          error={errors.payment}
        />

        <Checkbox
          label="Нужна упаковка"
          checked={form.packaging}
          onChange={(event) => setField('packaging', event.target.checked)}
        />

        <div className="checkout__submit">
          <Button type="submit" disabled={sending}>
            Оформить заказ
          </Button>
          {serverError && <p className="checkout__error">{serverError}</p>}
        </div>
      </form>
    </section>
  )
}

export default CheckoutForm
