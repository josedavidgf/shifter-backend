const supabase = require('../config/supabase');
const axios = require('axios');

async function savePushToken(userId, token) {
  const { error } = await supabase
    .from('push_tokens')
    .upsert(
      { user_id: userId, token, updated_at: new Date().toISOString() },
      { onConflict: ['user_id'] }
    );

  if (error) throw new Error(error.message);
}

async function sendPushToUser(userId, message) {
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

  return { sent: true };
}


module.exports = {
  savePushToken,
  sendPushToUser,
};
