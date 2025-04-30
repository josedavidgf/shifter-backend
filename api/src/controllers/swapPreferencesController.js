const { createSwapPreference, getMySwapPreferences, deleteSwapPreference } = require('../services/swapPreferencesService.js');
const { getWorkerByUserId } = require('../services/workerService.js');


async function handleCreateSwapPreference(req, res) {
    try {
        const userId = req.user.sub;
        const worker = await getWorkerByUserId(userId);
        if (!worker) return res.status(404).json({ success: false, message: 'Worker not found' });
        const workerId = worker.worker_id; // Asegúrate de que este dato venga en el token/session
        const { date, preference_type, hospital_id, speciality_id } = req.body;

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
async function handleExpireOldSwapPreferences(req, res) {
    try {
      const today = new Date().toISOString().split('T')[0];
  
      const { data: oldPreferences, error: readError } = await supabase
        .from('swap_preferences')
        .select('id')
        .lt('date', today);
  
      if (readError) throw new Error(readError.message);
  
      if (oldPreferences.length === 0) {
        return res.json({ success: true, message: 'No hay preferencias antiguas a eliminar' });
      }
  
      const idsToDelete = oldPreferences.map((p) => p.id);
  
      const { error: deleteError } = await supabase
        .from('swap_preferences')
        .delete()
        .in('id', idsToDelete);
  
      if (deleteError) throw new Error(deleteError.message);
  
      res.json({ success: true, message: `Se eliminaron ${idsToDelete.length} preferencias antiguas` });
    } catch (err) {
      console.error('❌ Error al eliminar swap preferences antiguas:', err.message);
      res.status(500).json({ success: false, message: err.message });
    }
  }
  

module.exports = {
    handleCreateSwapPreference,
    handleGetMySwapPreferences,
    handleDeleteSwapPreference,
    handleExpireOldSwapPreferences
};
