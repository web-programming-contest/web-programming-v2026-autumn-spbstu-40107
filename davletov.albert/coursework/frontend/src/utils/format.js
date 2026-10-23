export const formatPrice = (price) => `${price} ₽`

export const pluralize = (count, [one, few, many]) => {
  const lastTwo = count % 100
  const last = count % 10
  if (lastTwo >= 11 && lastTwo <= 14) {
    return many
  }
  if (last === 1) {
    return one
  }
  if (last >= 2 && last <= 4) {
    return few
  }
  return many
}

export const formatCount = (count) => `${count} ${pluralize(count, ['товар', 'товара', 'товаров'])}`

export const formatDate = (iso) => new Date(iso).toLocaleDateString('ru-RU')
