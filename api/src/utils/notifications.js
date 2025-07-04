const { param } = require('../routes/pushRoutes');
const { formatFriendlyDate } = require('./formatFriendlyDate');
const { translateShiftType } = require('./translateService');

function swapProposed({ from, to, shift_type, swap_id }) {
    const friendlyDate = formatFriendlyDate(to || '');
    const translatedType = translateShiftType(shift_type || '');
    console.log('swap_id', swap_id);

    return {
        title: 'Nuevo intercambio propuesto',
        body: `${from} quiere intercambiar su turno por tu turno del ${friendlyDate} de ${translatedType}.`,
        data: {
            route: 'SwapDetails',
            params: { swap_id },
            type: 'swap_proposed',
        },
    };
}

function shiftReminder({ shifts }) {
    const translatedList = shifts.map(s => translateShiftType(s.shift_type));
    const listText = translatedList.join(' y ');
    const plural = shifts.length > 1;
    console.log('shifts', shifts);
    console.log('listText', listText);
    console.log('plural', plural);


    return {
        title: plural ? 'Recordatorio de turnos' : 'Recordatorio de turno',
        body: plural
            ? `Mañana tienes ${shifts.length} turnos: ${listText}.`
            : `Recuerda que mañana tienes un turno de ${listText}.`,
        data: {
            route: 'Calendar',
            params: {},
            type: 'shift_reminder',
        },
    };
}


function swapAccepted({ by, shiftDate, shiftType, swapId }) {
    const friendlyDate = formatFriendlyDate(shiftDate || '');
    const translatedType = translateShiftType(shiftType || '');
    const byFullName = `${by.name} ${by.surname}` || 'Un colega';
    console.log('swapId - notifications', swapId);

    return {
        title: 'Intercambio aceptado',
        body: `${byFullName} aceptó tu intercambio del ${friendlyDate} ${translatedType}.`,
        data: {
            route: 'SwapDetails',
            params: { swapId },
            type: 'swap_accepted',
        },
    };
}

function swapRejected({ by, shiftDate, shiftType, swapId }) {
    const friendlyDate = formatFriendlyDate(shiftDate || '');
    const translatedType = translateShiftType(shiftType || '');
    const byFullName = `${by.name} ${by.surname}` || 'Un colega';

    return {
        title: 'Intercambio rechazado',
        body: `${byFullName} rechazó tu intercambio del ${friendlyDate} ${translatedType}.`,
        data: {
            route: 'SwapDetails',
            params: { swapId },
            type: 'swap_rejected',
        },
    };
}

function swapCancelled({ by, shiftDate, shiftType, swapId }) {
    const friendlyDate = formatFriendlyDate(shiftDate || '');
    const translatedType = translateShiftType(shiftType || '');
    const byFullName = `${by.name} ${by.surname}` || 'Un colega';

    return {
        title: 'Intercambio cancelado',
        body: `${byFullName} canceló tu intercambio del ${friendlyDate} ${translatedType}.`,
        data: {
            route: 'SwapDetails',
            params: { swapId },
            type: 'swap_cancelled',
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
            route: 'ProposeSwap',
            params: { shiftId },
        },
    };
}

function shiftPublishedNoReturn({ publisher, shiftType, shiftDate, shiftId }) {
    console.log('shiftPublishedNoReturn', { publisher, shiftType, shiftDate, shiftId });
    const friendlyDate = formatFriendlyDate(shiftDate || '');
    const translatedType = translateShiftType(shiftType || '');
    return {
        title: 'Turno sin devolución disponible',
        body: `${publisher} ha publicado un turno sin devolución el ${friendlyDate} ${translatedType}.`,
        data: {
            type: 'shift_published_no_return',
            shift_id: { shiftId },
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
    swapCancelled,
};
