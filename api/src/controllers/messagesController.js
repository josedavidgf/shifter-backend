const { getWorkerByUserId } = require('../services/workerService');
const {
  markMessagesAsRead,
  getUnreadMessagesPerChat,
} = require('../services/messagesService');

async function markMessagesAsReadHandler(req, res) {
  try {
    const userId = req.user.sub;
    const worker = await getWorkerByUserId(userId);
    if (!worker) return res.status(403).json({ error: 'Unauthorized' });

    await markMessagesAsRead(req.body.swap_id, worker.worker_id);
    res.json({ success: true });
  } catch (err) {
    console.error('❌ Error al marcar como leído:', err.message);
    res.status(500).json({ error: 'Error interno al marcar mensajes' });
  }
}
async function getUnreadMessagesHandler(req, res) {
  try {
    const userId = req.user.sub;
    const worker = await getWorkerByUserId(userId);
    if (!worker) return res.status(403).json({ error: 'Unauthorized' });

    const result = await getUnreadMessagesPerChat(worker.worker_id);
    res.json({ data: result });
  } catch (err) {
    console.error('❌ Error al obtener mensajes no leídos:', err.message);
    res.status(500).json({ error: 'Error interno' });
  }
}

module.exports = {
  markMessagesAsReadHandler,
  getUnreadMessagesHandler,
};