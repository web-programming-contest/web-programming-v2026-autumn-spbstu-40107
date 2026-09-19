export function analyzieString(str) {
  let length;

  if (typeof str === 'number') {
    str = str.toString();
    length = str.length;
  } else {
    length = str.length;
  }

  let letterPattern = /\p{L}/u;
  let digPattern = /[0-9]/;
  let letterCount = 0;
  let digCount = 0;
  let spaceCount = 0;
  let othCount = 0;

  for (let ch of str) {
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
