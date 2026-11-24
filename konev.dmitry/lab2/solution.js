export function calculateExpression(expr) {
  const tokens = [];
  const tokenPattern = /\s*(\d+(?:\.\d+)?|[()+\-*/])/y;
  let position = 0;

  while (position < expr.length) {
    if (/\s/.test(expr[position])) {
      position += 1;
      continue;
    }

    tokenPattern.lastIndex = position;
    const match = tokenPattern.exec(expr);

    if (!match) {
      throw new Error('Некорректное выражение');
    }

    tokens.push(match[1]);
    position = tokenPattern.lastIndex;
  }

  let index = 0;

  function parseExpression() {
    let result = parseTerm();

    while (tokens[index] === '+' || tokens[index] === '-') {
      const operator = tokens[index++];

      if (operator === '+') {
        result += parseTerm();
      } else {
        result -= parseTerm();
      }
    }

    return result;
  }

  function parseTerm() {
    let result = parseFactor();

    while (tokens[index] === '*' || tokens[index] === '/') {
      const operator = tokens[index++];

      if (operator === '*') {
        result *= parseFactor();
      } else {
        const divisor = parseFactor();

        if (divisor === 0) {
          throw new Error('Деление на ноль');
        }

        result /= divisor;
      }
    }

    return result;
  }

  function parseFactor() {
    const token = tokens[index++];

    if (token === '+') {
      return parseFactor();
    }

    if (token === '-') {
      return -parseFactor();
    }

    if (token === '(') {
      const result = parseExpression();

      if (tokens[index++] !== ')') {
        throw new Error('Не закрыта скобка');
      }

      return result;
    }

    const number = Number(token);

    if (!Number.isFinite(number)) {
      throw new Error('Ожидалось число');
    }

    return number;
  }

  if (tokens.length === 0) {
    throw new Error('Пустое выражение');
  }

  const result = parseExpression();

  if (index !== tokens.length) {
    throw new Error('Некорректное выражение');
  }

  return result;
}
