const { isFeatureEnabled } = require('../services/featureFlagService');
const { getWorkerByUserId } = require('../services/workerService'); // ✅ este es el correcto

const getAllFlagsForUser = async (req, res) => {
  try {
    const userId = req.user.sub;
    const worker = await getWorkerByUserId(userId);
    if (!worker) {
      return res.status(404).json({ success: false, message: 'Worker not found' });
    }

    const workerId = worker.worker_id;
    const hospitalId = worker.workers_hospitals?.[0]?.hospital_id || null;

    const featureNames = [
      'chat_tanda_ai'
    ];

    const flags = {};
    for (const name of featureNames) {
      flags[name] = await isFeatureEnabled(name, workerId, hospitalId);
    }

    return res.status(200).json({ success: true, flags });
  } catch (err) {
    console.error('❌ Error obteniendo flags:', err.message);
    return res.status(500).json({ success: false, message: 'Internal error' });
  }
};

module.exports = {
  getAllFlagsForUser,
};
