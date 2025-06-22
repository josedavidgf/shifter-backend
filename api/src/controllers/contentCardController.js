const { getWorkerByUserId } = require('../services/workerService');
const { getContentCardsForUser, dismissContentCard } = require('../services/contentCardService');

const getCards = async (req, res) => {
  try {
    const userId = req.user.sub;
    const worker = await getWorkerByUserId(userId);
    if (!worker) return res.status(404).json({ success: false, message: 'Worker not found' });

    const cards = await getContentCardsForUser(
      worker.user_id,
      worker.worker_id,
      worker.workers_hospitals?.[0]?.hospital_id || null,
      worker.worker_type_id || null,
      worker.workers_specialities?.[0]?.speciality_id || null
    );

    console.log('Content cards for user:', cards);

    return res.status(200).json({ success: true, cards });
  } catch (err) {
    console.error('❌ Error al obtener content cards:', err.message);
    return res.status(500).json({ success: false, message: 'Internal error' });
  }
};

const dismissCard = async (req, res) => {
  try {
    const userId = req.user.sub;
    const worker = await getWorkerByUserId(userId);
    if (!worker) return res.status(404).json({ success: false, message: 'Worker not found' });

    const contentCardId = req.params.id;
    await dismissContentCard(worker.worker_id, contentCardId);

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('❌ Error al descartar content card:', err.message);
    return res.status(500).json({ success: false, message: 'Internal error' });
  }
};

module.exports = {
  getCards,
  dismissCard,
};