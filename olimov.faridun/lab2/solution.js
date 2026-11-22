export function isPerfectNumber(num) {
  if (typeof num !== 'number' || !Number.isInteger(num) || num <= 1) {
    return false;
  }

  let sum = 1;

  for (let i = 2; i * i <= num; i += 1) {
    if (num % i === 0) {
      sum += i;

      const pair = num / i;
      if (pair !== i) {
        sum += pair;
      }
    }
  }

  return sum === num;
}
