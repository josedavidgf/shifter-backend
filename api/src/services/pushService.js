const { shouldSendSwapEmail } = require('./userPreferencesService');

const ONESIGNAL_APP_ID = process.env.ONESIGNAL_APP_ID;
const ONESIGNAL_REST_API_KEY = process.env.ONESIGNAL_REST_API_KEY;

async function sendPushNotification(externalUserId, heading, message, data = {}) {
  if (!externalUserId) {
    console.warn('[Push] externalUserId vacío, no se envía push');
    return;
  }

  try {
    const res = await fetch('https://onesignal.com/api/v1/notifications', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${process.env.ONESIGNAL_REST_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        app_id: process.env.ONESIGNAL_APP_ID,
        include_external_user_ids: [externalUserId],
        headings: { en: heading },
        contents: { en: message },
        data
      })
    });

    const responseData = await res.json();

    if (!res.ok) {
      console.error('[Push] Error OneSignal:', responseData);
    } else {
      console.log(`[Push] Notificación enviada:`, responseData.id);
    }
  } catch (err) {
    console.error('[Push] Error inesperado:', err.message || err);
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
  sendPushNotification,
  sendSwapProposalPush
};
