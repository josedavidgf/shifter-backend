const { parseISO, format, isToday, isTomorrow } = require('date-fns');
const es = require('date-fns/locale/es');

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function formatFriendlyDate(date) {
  const d = typeof date === 'string' ? parseISO(date) : date;

  if (isToday(d)) return `Hoy, ${format(d, 'dd/MM')}`;
  if (isTomorrow(d)) return `Mañana, ${format(d, 'dd/MM')}`;

  return capitalize(format(d, 'EEEE, dd/MM', { locale: es }));
}

module.exports = { formatFriendlyDate };
