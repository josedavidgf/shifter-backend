const axios = require('axios');
const { shouldSendSwapEmail } = require('./userPreferencesService');

const ONESIGNAL_APP_ID = process.env.ONESIGNAL_APP_ID;
const ONESIGNAL_REST_API_KEY = process.env.ONESIGNAL_REST_API_KEY;

async function sendPushNotification(externalUserId, heading, message, data = {}) {
  try {
    await axios.post('https://onesignal.com/api/v1/notifications', {
      app_id: ONESIGNAL_APP_ID,
      include_external_user_ids: [externalUserId],
      headings: { en: heading },
      contents: { en: message },
      data
    }, {
      headers: {
        Authorization: `Basic ${ONESIGNAL_REST_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });
  } catch (err) {
    console.error('❌ Error al enviar push:', err.response?.data || err.message);
  }
}

async function sendSwapProposalPush(userId, shift, offered) {
  const allow = await shouldSendSwapEmail(userId);
  if (!allow) return;

  const heading = '📩 Nuevo intercambio de turno';
  const message = `${offered.requester_name} te propone un intercambio para el ${shift.date}`;
  const data = {
    type: 'swap',
    swap_comments: offered.swap_comments,
    offered_date: offered.offered_date,
    shift_date: shift.date
  };

  await sendPushNotification(userId, heading, message, data);
}

module.exports = {
  sendSwapProposalPush
};
