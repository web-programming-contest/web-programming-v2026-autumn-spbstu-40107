export function removeOrderedItems(items, ordered) {
  return items.map((item) => ({
    ...item,
    quantity: item.quantity - (ordered.find((product) => product.productId === item.productId)?.quantity || 0),
  })).filter((item) => item.quantity > 0);
}
