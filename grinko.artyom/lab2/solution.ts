export function formatPhoneNumber(phoneStr: string): string {
  const digits = phoneStr.replace(/\D/g, '');

  let normalized = digits;
  if (normalized.startsWith('8') && normalized.length === 11) {
    normalized = `7${normalized.slice(1)}`;
  }
  if (normalized.startsWith('+7') && normalized.length === 12) {
    normalized = normalized.slice(1);
  }
  if (normalized.length === 10) {
    normalized = `7${normalized}`;
  }

  const last10 = normalized.slice(-10);
  const area = last10.slice(0, 3);
  const block = last10.slice(3, 6);
  const part1 = last10.slice(6, 8);
  const part2 = last10.slice(8, 10);

  return `+7 (${area}) ${block}-${part1}-${part2}`;
}
