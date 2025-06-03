const supabase = require('../config/supabase');
const axios = require('axios');

const { getUsersForPublishedShift } = require('./workerService');
const { shouldSendShiftPublishedPushNotification } = require('./userPreferencesService');
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
        data: message.data || {},
    });
    console.log('Push notification sent successfully to user:', userId);
    console.log('Push message:', message);
    console.log('Push token:', data.token);
    console.log('Push response:', { sent: true });
    return { sent: true };
}

async function notifyEligibleWorkersOfNewShift({ hospital_id, worker_type_id, speciality_id, shift_date, shift_type, requires_return, shift_id, shift_owner_name, shift_owner_surname }) {
    const candidates = await getUsersForPublishedShift({ hospital_id, worker_type_id, speciality_id });
    for (const { user_id } of candidates) {
        const wantsPush = await shouldSendShiftPublishedPushNotification(user_id);
        if (!wantsPush) continue;

        const msg = requires_return
            ? notifications.shiftPublishedWithReturn({ publisher: `${shift_owner_name} ${shift_owner_surname}`, shiftType: shift_type, shiftDate: shift_date, shiftId: shift_id })
            : notifications.shiftPublishedNoReturn({ publisher: `${shift_owner_name} ${shift_owner_surname}`, shiftType: shift_type, shiftDate: shift_date, shiftId: shift_id });

        const result = await sendPushToUser(user_id, msg);
        if (!result.sent) console.warn(`⚠️ Push no enviada a ${user_id}:`, result.reason);
    }
}



module.exports = {
    savePushToken,
    sendPushToUser,
    notifyEligibleWorkersOfNewShift,
};
