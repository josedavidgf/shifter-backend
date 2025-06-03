const { parseISO, format, isToday, isTomorrow } = require('date-fns');

const DAYS_ES = {
  monday: 'Lunes',
  tuesday: 'Martes',
  wednesday: 'Miércoles',
  thursday: 'Jueves',
  friday: 'Viernes',
  saturday: 'Sábado',
  sunday: 'Domingo',
};

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function formatFriendlyDate(date) {
  if (!date) return 'una fecha desconocida';

  const d = typeof date === 'string' ? parseISO(date) : date;

  try {
    if (isToday(d)) return `Hoy, ${format(d, 'dd/MM')}`;
    if (isTomorrow(d)) return `Mañana, ${format(d, 'dd/MM')}`;

    const weekdayEn = format(d, 'EEEE').toLowerCase(); // Ej: "monday"
    const weekdayEs = DAYS_ES[weekdayEn] || weekdayEn;

    return `${weekdayEs}, ${format(d, 'dd/MM')}`;
  } catch (err) {
    console.warn('[formatFriendlyDate] Error formateando:', err.message);
    return 'una fecha';
  }
}

module.exports = { formatFriendlyDate };
