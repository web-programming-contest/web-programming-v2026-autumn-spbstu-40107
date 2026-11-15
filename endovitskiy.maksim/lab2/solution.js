export function formatPhoneNumber(phoneStr) {
  let digits = String(phoneStr).replace(/\D/g, '');

  if (digits.length === 11 && (digits[0] === '7' || digits[0] === '8')) {
    digits = digits.slice(1);
  }

  if (digits.length !== 10) {
    throw new Error(
      `Ожидалось 10 цифр номера, получено ${digits.length}: "${phoneStr}"`,
    );
  }

  const code = digits.slice(0, 3);
  const part1 = digits.slice(3, 6);
  const part2 = digits.slice(6, 8);
  const part3 = digits.slice(8, 10);

  return `+7 (${code}) ${part1}-${part2}-${part3}`;
}
