export function validateCheckout(form) {
  const errors = {};
  if (!/^\+?[\d\s()\-]+$/.test(form.phone.trim()) || !/^\d{10,15}$/.test(form.phone.replace(/\D/g, ''))) errors.phone = 'Введите номер телефона: от 10 до 15 цифр.';
  if (form.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) errors.email = 'Введите корректную почту.';
  if (form.deliveryMethod === 'delivery' && !form.address.trim()) errors.address = 'Укажите адрес доставки.';
  if (!form.paymentMethod) errors.paymentMethod = 'Выберите способ оплаты.';
  return errors;
}
