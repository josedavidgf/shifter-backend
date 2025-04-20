const { createSwapPreference, getMySwapPreferences, deleteSwapPreference } = require('../services/swapPreferencesService.js');
const { getWorkerByUserId } = require('../services/workerService');


async function handleCreateSwapPreference(req, res) {
    try {
        const userId = req.user.sub;
        const worker = await getWorkerByUserId(userId);
        if (!worker) return res.status(404).json({ success: false, message: 'Worker not found' });
        console.log('worker:', worker);
        const workerId = worker.worker_id; // Asegúrate de que este dato venga en el token/session
        const { date, preference_type, hospital_id, speciality_id } = req.body;

        console.log('date', date);
        console.log('worker_id:', workerId);
        console.log('preference_type:', preference_type);
        console.log('hospital_id:', hospital_id);
        console.log('speciality_id:', speciality_id);

        const newPreference = await createSwapPreference({
            worker_id: workerId,
            date,
            preference_type,
            hospital_id,
            speciality_id,
        });

        return res.status(201).json(newPreference);
    } catch (error) {
        console.error('Error creating swap preference:', error);
        return res.status(500).json({ error: error.message });
    }
}

async function handleGetMySwapPreferences(req, res) {
    try {
        const userId = req.user.sub;
        const worker = await getWorkerByUserId(userId);
        if (!worker) return res.status(404).json({ success: false, message: 'Worker not found' });
        console.log('worker:', worker);
        const workerId = worker.worker_id; // Asegúrate de que este dato venga en el token/session
        const preferences = await getMySwapPreferences(workerId);
        return res.status(200).json(preferences);
    } catch (error) {
        console.error('Error fetching swap preferences:', error);
        return res.status(500).json({ error: error.message });
    }
}

async function handleDeleteSwapPreference(req, res) {
    try {
        const { preferenceId } = req.params;
        await deleteSwapPreference(preferenceId);
        return res.status(204).send();
    } catch (error) {
        console.error('Error deleting swap preference:', error);
        return res.status(500).json({ error: error.message });
    }
}

module.exports = {
    handleCreateSwapPreference,
    handleGetMySwapPreferences,
    handleDeleteSwapPreference
};
