const { formatFriendlyDate } = require('./formatFriendlyDate');
const { translateShiftType } = require('./translateService');

function swapProposed({ from, to, shift_type }) {
  const friendlyDate = formatFriendlyDate(to || '');
  const translatedType = translateShiftType(shift_type || '');

  return {
    title: 'Nuevo intercambio propuesto',
    body: `${from} quiere intercambiar su turno por tu turno del ${friendlyDate} de ${translatedType}.`,
    data: {
      type: 'swap_proposed',
      from,
      to,
      shift_type,
    },
  };
}

function shiftReminder({ shiftType, date }) {
  return {
    title: `Turno programado: ${capitalize(shiftType)}`,
    body: `Recuerda que mañana tienes un turno de ${shiftType}.`,
    data: { shiftType, date },
  };
}

function shiftNoReturn() {
  return {
    title: 'Turno sin devolución',
    body: 'Hay turnos publicados que no requieren devolución. Échales un vistazo.',
    data: { type: 'no_return_shift' },
  };
}

function capitalize(text) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

module.exports = {
  swapProposed,
  shiftReminder,
  shiftNoReturn,
};
