const SIGNS = [
  [120, 'Водолей'],
  [219, 'Рыбы'],
  [321, 'Овен'],
  [420, 'Телец'],
  [521, 'Близнецы'],
  [621, 'Рак'],
  [723, 'Лев'],
  [823, 'Дева'],
  [923, 'Весы'],
  [1023, 'Скорпион'],
  [1123, 'Стрелец'],
  [1222, 'Козерог'],
];

export function getZodiacSign(date) {
  const monthDay = (date.getMonth() + 1) * 100 + date.getDate();
  const [, sign] =
    SIGNS.findLast(([start]) => start <= monthDay) ?? SIGNS.at(-1);
  return sign;
}
