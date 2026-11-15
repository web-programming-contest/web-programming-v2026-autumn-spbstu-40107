export function countVowels(str) {
  let count = 0;

  for (const char of str) {
    if ('aeiouAEIOU'.includes(char)) {
      count += 1;
    }
  }

  return count;
}
