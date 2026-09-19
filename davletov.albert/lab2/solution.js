export function analyzieString(str) {
  if (typeof str === 'number') {
    str = str.toString();
  }

  const letterPattern = /\p{L}/u;
  const digPattern = /[0-9]/;
  let letterCount = 0;
  let digCount = 0;
  let spaceCount = 0;
  let othCount = 0;

  for (const ch of str) {
    if (letterPattern.test(ch) === true) {
      letterCount++;
    } else if (digPattern.test(ch) === true) {
      digCount++;
    } else if (ch === ' ') {
      spaceCount++;
    } else {
      othCount++;
    }
  }

  return {
    letters: letterCount,
    digits: digCount,
    spaces: spaceCount,
    other: othCount,
  };
}
