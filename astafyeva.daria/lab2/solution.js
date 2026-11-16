const MS_IN_MINUTE = 60 * 1000;
const MS_IN_HOUR = 60 * MS_IN_MINUTE;
const MS_IN_DAY = 24 * MS_IN_HOUR;

/**
 * Выбирает русскую форму слова для числа n.
 * Например: 1 минута, 2 минуты, 5 минут, 11 минут, 21 минута.
 * @param {number} n
 * @param {[string, string, string]} forms — формы для 1, 2 и 5
 * @returns {string}
 */
function pluralize(n, [one, few, many]) {
  const lastTwo = n % 100;
  const last = n % 10;

  if (lastTwo >= 11 && lastTwo <= 14) {
    return many;
  }
  if (last === 1) {
    return one;
  }
  if (last >= 2 && last <= 4) {
    return few;
  }
  return many;
}

/**
 * Возвращает строку о том, сколько времени прошло с указанной даты.
 * @param {Date} date — дата в прошлом
 * @returns {string} например "5 минут назад"
 */
export function timeAgo(date) {
  const isDate = Object.prototype.toString.call(date) === '[object Date]';
  const time = isDate ? date.getTime() : Number.NaN;
  if (Number.isNaN(time)) {
    throw new TypeError('Ожидается корректный объект Date');
  }

  const diff = Date.now() - time;
  if (diff < 0) {
    throw new RangeError('Дата не может быть в будущем');
  }

  if (diff < MS_IN_MINUTE) {
    return 'только что';
  }
  if (diff < MS_IN_HOUR) {
    const minutes = Math.floor(diff / MS_IN_MINUTE);
    return `${minutes} ${pluralize(minutes, ['минуту', 'минуты', 'минут'])} назад`;
  }
  if (diff < MS_IN_DAY) {
    const hours = Math.floor(diff / MS_IN_HOUR);
    return `${hours} ${pluralize(hours, ['час', 'часа', 'часов'])} назад`;
  }
  const days = Math.floor(diff / MS_IN_DAY);
  return `${days} ${pluralize(days, ['день', 'дня', 'дней'])} назад`;
}
