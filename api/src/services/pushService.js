const supabase = require('../config/supabase');
const axios = require('axios');

const { getUsersForPublishedShift } = require('./workerService');
const {
    shouldSendShiftPublishedPushNotification,
    shouldSendSwapRespondedPushNotification,
    shouldSendSwapPushNotification
} = require('./userPreferencesService');
const { } = require('./userPreferencesService');
const { swapAccepted, swapRejected, swapProposed } = require('../utils/notifications');

const notifications = require('../utils/notifications');

async function savePushToken(userId, token) {
    console.log('Saving push token for user:', userId, 'Token:', token);
    const { error } = await supabase
        .from('push_tokens')
        .upsert(
            { user_id: userId, token, updated_at: new Date().toISOString() },
            { onConflict: ['user_id'] }
        );
    console.log('Push token saved:', { userId, token, error });
    if (error) throw new Error(error.message);
}

async function sendPushToUser(userId, message) {
    console.log('Sending push notification to user:', userId, 'Message:', message);
    const { data, error } = await supabase
        .from('push_tokens')
        .select('token')
        .eq('user_id', userId)
        .single();

    if (error || !data?.token) return { sent: false, reason: 'Token not found' };

    await axios.post('https://exp.host/--/api/v2/push/send', {
        to: data.token,
        sound: 'default',
        title: message.title,
        body: message.body,
        data: {
            ...(message.route && { route: message.route }),
            ...(message.params && { params: message.params }),
            ...(message.data || {})
        },
    });
    console.log('Push notification sent successfully to user:', userId);
    console.log('Push message:', message);
    console.log('Push token:', data.token);
    console.log('Push response:', { sent: true });
    return { sent: true };
}

async function notifyEligibleWorkersOfNewShift({
    hospital_id,
    worker_type_id,
    speciality_id,
    shift_date,
    shift_type,
    requires_return,
    shift_id,
    shift_owner_name,
    shift_owner_surname
}) {
    const candidates = await getUsersForPublishedShift({ hospital_id, worker_type_id, speciality_id });

    const pushTasks = candidates.map(async ({ user_id }) => {
        const wantsPush = await shouldSendShiftPublishedPushNotification(user_id);
        if (!wantsPush) return { user_id, sent: false, reason: 'Preferencias' };

        const msg = requires_return
            ? notifications.shiftPublishedWithReturn({
                publisher: `${shift_owner_name} ${shift_owner_surname}`,
                shiftType: shift_type,
                shiftDate: shift_date,
                shiftId: shift_id
            })
            : notifications.shiftPublishedNoReturn({
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

    const payload = type === 'accepted'
        ? swapAccepted({ by, shiftDate, shiftType, swapId })
        : swapRejected({ by, shiftDate, shiftType, swapId });
    console.log('Sending swap response notification:', payload);
    console.log('User ID:', userId);
    await sendPushToUser(userId, payload);
}

async function sendSwapProposedNotification({ userId, from, shiftDate, shiftType, swapId }) {
    const shouldSend = await shouldSendSwapPushNotification(userId);
    if (!shouldSend) return;

    const payload = swapProposed({ from, to: shiftDate, shift_type: shiftType, swap_id: swapId });
    console.log('Sending swap proposed notification:', payload);
    console.log('User ID:', userId);
    await sendPushToUser(userId, payload);
}

module.exports = {
    savePushToken,
    sendPushToUser,
    notifyEligibleWorkersOfNewShift,
    sendSwapRespondedNotification,
    sendSwapProposedNotification,
};
