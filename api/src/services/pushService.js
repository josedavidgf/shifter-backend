const supabase = require('../config/supabase');
const axios = require('axios');

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


module.exports = {
    savePushToken,
    sendPushToUser,
};
