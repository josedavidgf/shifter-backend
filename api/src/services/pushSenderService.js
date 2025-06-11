const axios = require('axios');

const ONESIGNAL_APP_ID = process.env.ONESIGNAL_APP_ID;
const ONESIGNAL_REST_API_KEY = process.env.ONESIGNAL_REST_API_KEY;

console.log('🟡 OneSignal APP ID:', ONESIGNAL_APP_ID);
console.log('🟡 OneSignal API KEY:', ONESIGNAL_REST_API_KEY ? '✔️ Present' : '❌ Missing');

async function sendPushToUser(userId, message) {
  console.log('📤 Enviando push via OneSignal a userId:', userId);

  try {
    const response = await axios.post('https://onesignal.com/api/v1/notifications', {
      app_id: ONESIGNAL_APP_ID,
      channel_for_external_user_ids: "push",
      include_external_user_ids: [userId],
      android_channel_id: "8580f787-a211-4060-b3b3-de3ebf74a694",
      headings: { en: message.title },
      contents: { en: message.body },
      data: {
        ...(message.route && { route: message.route }),
        ...(message.params && { params: message.params }),
        ...(message.data || {}),
      },
    }, {
      headers: {
        Authorization: `Basic ${ONESIGNAL_REST_API_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    console.log('✅ Push enviada correctamente:', response.data);
    return { sent: true };

  } catch (err) {
    console.error('❌ Error al enviar push:', err.response?.status, err.response?.data || err.message);
    return { sent: false, reason: err.response?.data || err.message };
  }
}

module.exports = {
  sendPushToUser,
};
