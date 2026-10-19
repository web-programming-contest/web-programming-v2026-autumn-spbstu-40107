function calculateExpression(expr) {
  const expression = expr.match(/\d+\.?\d*|[+\-*/]/g);

  let i = 0;
  while (i < expression.length) {
    if (expression[i] === '*' || expression[i] === '/') {
      const number1 = Number(expression[i - 1]);
      const number2 = Number(expression[i + 1]);

      let value;
      if (expression[i] === '*') {
        value = number1 * number2;
      } else {
        value = number1 / number2;
      }

      expression.splice(i - 1, 3, value);
    } else {
      i++;
    }
  }

  let result = Number(expression[0]);
  for (let j = 1; j < expression.length; j += 2) {
    const sign = expression[j];
    const number = Number(expression[j + 1]);
    if (sign === '+') {
      result += number;
    } else {
      result -= number;
    }
  }

  return result;
}

export {calculateExpression};
