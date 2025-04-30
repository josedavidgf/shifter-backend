const {
    createShift,
    getShiftsByWorkerId,
    updateShift,
    removeShift,
    getHospitalShifts,
    createShiftPreferences,
    getShiftPreferencesByShiftId,
    replaceShiftPreferences,
    getShiftsPublishedByWorkerId
} = require('../services/shiftService');
const { getWorkerByUserId, getWorkerHospital } = require('../services/workerService');
const supabase = require('../config/supabase');


async function handleCreateShift(req, res) {
    try {
        const userId = req.user.sub;
        const worker = await getWorkerByUserId(userId);
        if (!worker) return res.status(404).json({ success: false, message: 'Worker not found' });

        //const hospitalInfo = await getWorkerHospital(worker.worker_id);
        const hospital = worker.workers_hospitals?.[0]?.hospital_id;
        if (!hospital) return res.status(400).json({ success: false, message: 'No hospital assigned to worker' });

        const {
            date,
            shift_type,
            shift_label,
            speciality_id,
            shift_comments,
            preferences
        } = req.body;

        if (!speciality_id) {
            return res.status(400).json({ success: false, message: 'speciality_id is required' });
        }

        const today = new Date().toISOString().split('T')[0]; // formato YYYY-MM-DD
        if (date < today) {
            return res.status(400).json({ success: false, message: 'La fecha del turno no puede ser anterior a hoy.' });
        }

        const newShift = await createShift({
            worker_id: worker.worker_id,
            hospital_id: hospital,
            speciality_id,
            date,
            shift_type,
            shift_label: 'regular',
            state: 'published',
            shift_comments,
        });
        //console.log('🟢 Shift creado:', newShift);
        //console.log('🟢 Preferences:', preferences);
        if (Array.isArray(preferences) && preferences.length > 0) {
            await createShiftPreferences(newShift.shift_id, preferences);
        }
        res.status(201).json({ success: true, data: newShift });
    } catch (err) {
        console.error('❌ Shift creation error:', err.message);
        res.status(500).json({ success: false, message: err.message });
    }
}


async function handleGetMyShifts(req, res) {
    try {
        const userId = req.user?.sub; // O req.user.id si lo tienes así
        const worker = await getWorkerByUserId(userId);
        if (!worker) return res.status(404).json({ success: false, message: 'Worker not found' });

        const shifts = await getShiftsByWorkerId(worker.worker_id);
        res.json({ success: true, data: shifts });
    } catch (err) {
        console.error('❌ Error al obtener mis turnos:', err.message);
        res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
}

async function handleGetMyShiftsPublished(req, res) {
    try {
        const userId = req.user?.sub; // O req.user.id si lo tienes así
        const worker = await getWorkerByUserId(userId);
        if (!worker) return res.status(404).json({ success: false, message: 'Worker not found' });
        //console.log('⚠️⚠️⚠️⚠️⚠️', worker);
        const shifts = await getShiftsPublishedByWorkerId(worker.worker_id);
        //console.log('⚠️⚠️⚠️⚠️⚠️', shifts);
        res.json({ success: true, data: shifts });
    } catch (err) {
        console.error('❌ Error al obtener mis turnos:', err.message);
        res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
}

async function handleGetShiftById(req, res) {
    const shiftId = req.params.id;

    const { data, error } = await supabase
        .from('shifts')
        .select(`
      shift_id,
      date,
      shift_type,
      shift_label,
      shift_comments,
      worker:worker_id (
        worker_id,
        name,
        surname,
        swap_preferences (
          preference_id,
          date,
          preference_type
        )
      )
    `)
        .eq('shift_id', shiftId)
        .single();

    if (error) return res.status(404).json({ success: false, message: error.message });
    // ⚡ Aquí filtramos preferencias vencidas
    const today = new Date().toISOString().split('T')[0];

    if (data?.worker?.swap_preferences) {
        data.worker.swap_preferences = data.worker.swap_preferences.filter(pref => pref.date >= today);
    }

    res.json({ success: true, data });
}

async function handleUpdateShift(req, res) {
    try {
        const userId = req.user?.sub;
        const shiftId = req.params.id;
        const updates = req.body;
        //console.log('🟡 Actualizando turno:', shiftId, updates);
        const updated = await updateShift(shiftId, updates, userId);
        //console.log('🟢 Turno actualizado:', updated);
        res.json({ success: true, data: updated });
    } catch (err) {
        console.error('❌ Error al actualizar turno:', err.message);
        res.status(500).json({ success: false, message: err.message });
    }
}
async function handleRemoveShift(req, res) {
    try {
        const userId = req.user?.sub;
        const shiftId = req.params.id;

        const updated = await removeShift(shiftId, userId);
        res.json({ success: true, data: updated });
    } catch (err) {
        console.error('❌ Error al eliminar turno:', err.message);
        res.status(500).json({ success: false, message: err.message });
    }
}
async function handleGetHospitalShifts(req, res) {
    try {
        const userId = req.user?.sub;
        const worker = await getWorkerByUserId(userId);
        if (!worker) return res.status(404).json({ success: false, message: 'Worker not found' });
        //console.log('worker:', worker);
        //console.log('hospitalId:', worker.workers_hospitals?.[0]?.hospital_id);
        //console.log('hospital:', worker.workers_hospitals);
        //console.log('hospital:', hospital)
        if (!worker.workers_hospitals) return res.status(404).json({ success: false, message: 'Hospital not found' });
        //console.log('hospitalId:', worker.workers_hospitals?.[0]?.hospital_id);
        //console.log('workerId:', worker.worker_id);
        //console.log('workerType:', worker.worker_type_id)
        const shifts = await getHospitalShifts(worker.workers_hospitals?.[0]?.hospital_id, worker.worker_id, worker.worker_type_id);
        res.json({ success: true, data: shifts });
    } catch (err) {
        console.error('❌ Error al obtener turnos del hospital:', err.message);
        res.status(500).json({ success: false, message: err.message });
    }
}
async function handleGetShiftPreferences(req, res) {
    try {
        const shiftId = req.params.id;
        const data = await getShiftPreferencesByShiftId(shiftId);
        res.json({ success: true, data });
    } catch (err) {
        console.error('❌ Error al obtener preferencias:', err.message);
        res.status(500).json({ success: false, message: err.message });
    }
}

async function handleUpdateShiftPreferences(req, res) {
    try {
        const shiftId = req.params.id;
        const preferences = req.body.preferences;

        if (!Array.isArray(preferences)) {
            return res.status(400).json({ success: false, message: 'preferences must be an array' });
        }

        const data = await replaceShiftPreferences(shiftId, preferences);
        res.json({ success: true, data });
    } catch (err) {
        console.error('❌ Error al actualizar preferencias:', err.message);
        res.status(500).json({ success: false, message: err.message });
    }
}

module.exports = {
    handleCreateShift,
    handleGetMyShifts,
    handleUpdateShift,
    handleGetShiftById,
    handleRemoveShift,
    handleGetHospitalShifts,
    handleGetShiftPreferences,
    handleUpdateShiftPreferences,
    handleGetMyShiftsPublished
};

