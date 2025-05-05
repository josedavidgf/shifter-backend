const userEventsService = require("../services/userEventsService");
const { getWorkerByUserId } = require('../services/workerService.js');


const getEvents = async (req, res) => {
    const userId = req.user.sub;
    const worker = await getWorkerByUserId(userId);
    if (!worker) return res.status(404).json({ success: false, message: 'Worker not found' });
    const workerId = worker.worker_id; // Asegúrate de que este dato venga en el token/session
    const { data, error } = await userEventsService.getUserEvents(workerId);

    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
};

const markAsSeen = async (req, res) => {
    const userId = req.user.sub;
    const worker = await getWorkerByUserId(userId);
    if (!worker) return res.status(404).json({ success: false, message: 'Worker not found' });
    const workerId = worker.worker_id; // Asegúrate de que este dato venga en el token/session
    const { error } = await userEventsService.markUserEventsAsSeen(workerId);

    if (error) return res.status(500).json({ error: error.message });
    res.json({ success: true });
};

module.exports = {
    getEvents,
    markAsSeen,
};
