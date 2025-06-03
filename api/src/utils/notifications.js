const { formatFriendlyDate } = require('./formatFriendlyDate');
const { translateShiftType } = require('./translateService');

function swapProposed({ from, to, shift_type, swap_id }) {
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
            swap_id,
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

function swapAccepted({ by, shiftDate, shiftType, swapId }) {
    const friendlyDate = formatFriendlyDate(shiftDate || '');
    const translatedType = translateShiftType(shiftType || '');

    return {
        title: 'Intercambio aceptado',
        body: `${by} aceptó tu intercambio del ${friendlyDate} (${translatedType}).`,
        data: {
            type: 'swap_accepted',
            swap_id: swapId,
        },
    };
}

function swapRejected({ by, shiftDate, shiftType, swapId }) {
    const friendlyDate = formatFriendlyDate(shiftDate || '');
    const translatedType = translateShiftType(shiftType || '');

    return {
        title: 'Intercambio rechazado',
        body: `${by} rechazó tu intercambio del ${friendlyDate} (${translatedType}).`,
        data: {
            type: 'swap_rejected',
            swap_id: swapId,
        },
    };
}

function shiftPublishedWithReturn({ publisher, shiftType, shiftDate, shiftId }) {

    const friendlyDate = formatFriendlyDate(shiftDate || '');
    const translatedType = translateShiftType(shiftType || '');

    return {
        title: 'Turno disponible',
        body: `${publisher} ha publicado un turno con devolución el ${friendlyDate} ${translatedType}.`,
        data: {
            type: 'shift_published_with_return',
            shift_id: shiftId,
        },
    };
}

function shiftPublishedNoReturn({ publisher, shiftType, shiftDate, shiftId }) {
    console.log('shiftPublishedNoReturn', { publisher, shiftType, shiftDate, shiftId });
    const friendlyDate = formatFriendlyDate(shiftDate || '');
    const translatedType = translateShiftType(shiftType || '');
    return {
        title: 'Turno sin devolución disponible',
        body: `${publisher} ha publicado un turno sin devolución el ${friendlyDate} (${translatedType}).`,
        data: {
            type: 'shift_published_no_return',
            shift_id: shiftId,
        },
    };
}




function capitalize(text) {
    return text.charAt(0).toUpperCase() + text.slice(1);
}

module.exports = {
    swapProposed,
    swapAccepted,
    swapRejected,
    shiftReminder,
    shiftPublishedWithReturn,
    shiftPublishedNoReturn,

};
