const pushService = require('../services/pushService');

const registerPushToken = async (req, res) => {
  try {
    const { token, userId } = req.body;
    if (!token || !userId) return res.status(400).json({ error: 'Faltan datos' });

    await pushService.savePushToken(userId, token);
    return res.json({ success: true });
  } catch (err) {
    console.error('[registerPushToken]', err.message);
    return res.status(500).json({ error: err.message });
  }
};

const sendTestNotification = async (req, res) => {
  try {
    const { userId } = req.params;

    const result = await pushService.sendPushToUser(userId, {
      title: 'Notificación de prueba',
      body: 'Esto es una prueba de notificación push.',
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
