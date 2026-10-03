export function isPerfectNumber(num) {
  if (typeof num !== 'number' || !Number.isInteger(num) || num <= 1) {
    return false;
  }

  let sum = 1;
  const limit = Math.sqrt(num);

  for (let i = 2; i <= limit; i += 1) {
    if (num % i === 0) {
      sum += i;
      const pairedDivisor = num / i;
      if (pairedDivisor !== i) {
        sum += pairedDivisor;
      }
    }
  }

  return sum === num;
}
