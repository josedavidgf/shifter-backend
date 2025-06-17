const supabase = require('../config/supabase');
const axios = require('axios');
const { sendPushToUser } = require('./pushSenderService');


const { getUsersForPublishedShift } = require('./workerService');
const {
    shouldSendShiftPublishedPushNotification,
    shouldSendSwapRespondedPushNotification,
    shouldSendSwapPushNotification
} = require('./userPreferencesService');
const { } = require('./userPreferencesService');
const { swapAccepted, swapRejected, swapProposed, shiftPublishedWithReturn, shiftPublishedNoReturn } = require('../utils/notifications');

const notifications = require('../utils/notifications');



async function notifyEligibleWorkersOfNewShift({
    hospital_id,
    worker_type_id,
    speciality_id,
    shift_date,
    shift_type,
    requires_return,
    shift_id,
    shift_owner_name,
    shift_owner_surname,
    shift_owner_user_id
}) {
    const candidates = await getUsersForPublishedShift({ hospital_id, worker_type_id, speciality_id });
    console.log('candidates', candidates);

    const filteredCandidates = candidates.filter(c => c.user_id !== shift_owner_user_id);


    const pushTasks = filteredCandidates.map(async ({ user_id }) => {
        const wantsPush = await shouldSendShiftPublishedPushNotification(user_id);
        if (!wantsPush) return { user_id, sent: false, reason: 'Preferencias' };

        const msg = requires_return
            ? shiftPublishedWithReturn({
                publisher: `${shift_owner_name} ${shift_owner_surname}`,
                shiftType: shift_type,
                shiftDate: shift_date,
                shiftId: shift_id
            })
            : shiftPublishedNoReturn({
                publisher: `${shift_owner_name} ${shift_owner_surname}`,
                shiftType: shift_type,
                shiftDate: shift_date,
                shiftId: shift_id
            });

        const result = await sendPushToUser(user_id, msg);
        return { user_id, ...result };
    });

    const results = await Promise.all(pushTasks);

    results.forEach(({ user_id, sent, reason }) => {
        if (!sent) console.warn(`⚠️ Push no enviada a ${user_id}: ${reason}`);
    });
}


async function sendSwapRespondedNotification({ userId, type, by, shiftDate, shiftType, swapId }) {
    const shouldSend = await shouldSendSwapRespondedPushNotification(userId);
    if (!shouldSend) return;

    console.log('swapId sendSwapRespondedNotification', swapId);

    const payload = type === 'accepted'
        ? swapAccepted({ by, shiftDate, shiftType, swapId })
        : swapRejected({ by, shiftDate, shiftType, swapId });
    console.log('Sending swap response notification:', payload);
    console.log('User ID:', userId);
    await sendPushToUser(userId, payload);
}
async function sendSwapCancelledNotification({ userId, by, shiftDate, shiftType, swapId }) {
    const shouldSend = await shouldSendSwapRespondedPushNotification(userId);
    if (!shouldSend) return;

    const payload = swapCancelled({ by, shiftDate, shiftType, swapId });
    await sendPushToUser(userId, payload);
}

async function sendSwapProposedNotification({ userId, from, shiftDate, shiftType, swapId }) {
    const shouldSend = await shouldSendSwapPushNotification(userId);
    if (!shouldSend) return;

    console.log('swapId', swapId);

    const payload = swapProposed({ from, to: shiftDate, shift_type: shiftType, swap_id: swapId });
    console.log('Sending swap proposed notification:', payload);
    console.log('User ID:', userId);
    await sendPushToUser(userId, payload);
}

module.exports = {
    notifyEligibleWorkersOfNewShift,
    sendSwapRespondedNotification,
    sendSwapProposedNotification,
    sendSwapCancelledNotification
};
