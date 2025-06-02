const { formatFriendlyDate } = require('./formatFriendlyDate');
const translateService = require('./translateService');

module.exports = {
  shiftReminder: ({ shiftType, date }) => ({
    title: `Turno programado: ${capitalize(shiftType)}`,
    body: `Recuerda que mañana tienes un turno de ${shiftType}.`,
    data: { shift_type: shiftType, date },
  }),

  swapProposed: ({ from, to , type}) => ({
    title: `Nuevo intercambio propuesto`,
    body: `${from} quiere intercambiar su turno por tu turno del ${formatFriendlyDate(to)} de ${translateService(type)}.`,
    data: { type: 'swap_proposed', from, to },
  }),

  shiftNoReturn: () => ({
    title: 'Turno sin devolución',
    body: 'Hay turnos publicados que no requieren devolución. Échales un vistazo.',
    data: { type: 'no_return_shift' },
  }),

  // util interno opcional
  _preview: () => {
    return Object.entries(module.exports).reduce((acc, [k, fn]) => {
      if (typeof fn === 'function') {
        try {
          acc[k] = fn({ shiftType: 'mañana', date: '2025-06-03', from: 'Laura', to: '10/06' });
        } catch {}
      }
      return acc;
    }, {});
  }
};

function capitalize(text) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}
