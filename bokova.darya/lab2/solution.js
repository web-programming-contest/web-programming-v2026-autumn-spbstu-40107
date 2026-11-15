export function rgbToHex(rgb) {
  const match = rgb.match(
    /^\s*rgb\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)\s*$/i,
  );

  if (!match) {
    throw new Error(`Неверный формат строки: ${rgb}`);
  }

  const parts = match.slice(1).map(Number);

  if (parts.some((n) => n > 255)) {
    throw new Error('Значения должны быть в диапазоне 0–255');
  }

  return `#${parts
    .map((n) => n.toString(16).padStart(2, '0'))
    .join('')
    .toUpperCase()}`;
}
