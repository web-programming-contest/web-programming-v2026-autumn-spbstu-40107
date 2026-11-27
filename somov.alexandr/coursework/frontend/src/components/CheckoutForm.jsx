import {useState} from 'react';
import {api} from '../api.js';
import {validateCheckout} from '../checkout.js';
import {useAuth} from '../context/AuthContext.jsx';
import Field from './Field.jsx';

export default function CheckoutForm({items, onSuccess, sending, setSending}) {
  const auth = useAuth();
  const [form, setForm] = useState({phone: '', email: '', deliveryMethod: 'pickup', address: '', paymentMethod: '', needsPackaging: false});
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState('');

  async function submit(event) {
    event.preventDefault();
    const nextErrors = validateCheckout(form);
    setErrors(nextErrors);
    setMessage('');
    if (Object.keys(nextErrors).length || sending) return;
    setSending(true);
    try {
      const order = await api('/orders', {method: 'POST', body: {...form, items}});
      onSuccess(order);
    } catch (error) {
      setErrors(error.fieldErrors || {});
      setMessage(error.message);
      if (error.status === 401) await auth.refresh();
    } finally {
      setSending(false);
    }
  }

  return (
    <section className="checkout-section">
      <h2>Оформление заказа</h2>
      <form className="checkout-form" onSubmit={submit} noValidate>
        <fieldset disabled={sending} className="checkout-fields">
          <div className="form-row">
            <Field id="phone" label="Телефон" type="tel" name="phone" autoComplete="tel" required value={form.phone} onChange={(event) => setForm({...form, phone: event.target.value})} error={errors.phone} />
            <Field id="email" label="Почта" type="email" name="email" autoComplete="email" value={form.email} onChange={(event) => setForm({...form, email: event.target.value})} error={errors.email} />
          </div>
          <fieldset className="delivery-choice"><legend className="visually-hidden">Способ получения</legend>
            <label><input type="radio" name="deliveryMethod" value="pickup" checked={form.deliveryMethod === 'pickup'} onChange={() => setForm({...form, deliveryMethod: 'pickup'})} />Самовывоз</label>
            <label><input type="radio" name="deliveryMethod" value="delivery" checked={form.deliveryMethod === 'delivery'} onChange={() => setForm({...form, deliveryMethod: 'delivery'})} />Доставка</label>
          </fieldset>
          {form.deliveryMethod === 'delivery' && <Field id="address" label="Адрес доставки" name="address" autoComplete="street-address" required value={form.address} onChange={(event) => setForm({...form, address: event.target.value})} error={errors.address} />}
          <label className="form-field" htmlFor="payment"><span>Способ оплаты<span className="required-mark"> *</span></span>
            <select id="payment" name="paymentMethod" required value={form.paymentMethod} onChange={(event) => setForm({...form, paymentMethod: event.target.value})} aria-invalid={Boolean(errors.paymentMethod)} aria-describedby={errors.paymentMethod ? 'payment-error' : undefined}>
              <option value="">Не выбрано</option><option value="card">По карте</option><option value="cash">Наличными</option>
            </select>
            {errors.paymentMethod && <span className="field-error" id="payment-error">{errors.paymentMethod}</span>}
          </label>
          <label className="checkbox-label packaging"><input type="checkbox" checked={form.needsPackaging} onChange={(event) => setForm({...form, needsPackaging: event.target.checked})} />Нужна упаковка</label>
          {message && <p className="field-error" role="alert">{message}</p>}
          <button className="button" type="submit">{sending ? 'Оформляем…' : 'Оформить заказ'}</button>
        </fieldset>
      </form>
    </section>
  );
}
