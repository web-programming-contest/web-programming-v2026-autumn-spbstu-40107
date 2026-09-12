export function shuffleArray(arr) {
  const result = [...arr];
  let i = result.length;
  while (i > 0) {
    const j = Math.floor(Math.random() * i);
    i--;
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}
