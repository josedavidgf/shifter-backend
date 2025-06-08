const { savePushToken, sendPushToUser } = require('../services/pushTokenService');

const registerPushToken = async (req, res) => {
  try {
    const { token, userId } = req.body;
    if (!token || !userId) return res.status(400).json({ error: 'Faltan datos' });
    console.log('Registering push token for user:', userId, 'Token:', token);
    await savePushToken(userId, token);
    return res.json({ success: true });
  } catch (err) {
    console.error('[registerPushToken]', err.message);
    return res.status(500).json({ error: err.message });
  }
};

const sendTestNotification = async (req, res) => {
  try {
    const { userId } = req.params;

    const result = await sendPushToUser(userId, {
      title: 'Prueba de Swap',
      body: 'Haz clic para ver el swap.',
      route: 'SwapDetails',
      params: { swapId: 'ff1ca629-6bd3-4ca9-b573-31b697a6401f' },
    });


    if (result.sent) return res.json({ success: true });
    return res.status(404).json({ error: result.reason });
  } catch (err) {
    console.error('[sendTestNotification]', err.message);
    return res.status(500).json({ error: err.message });
  }
};


module.exports = {
  registerPushToken,
  sendTestNotification,
};
