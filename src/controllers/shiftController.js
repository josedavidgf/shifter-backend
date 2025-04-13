const {
    createShift,
    getShiftsByWorkerId,
    updateShift,
    removeShift,
    getHospitalShifts,
    createShiftPreferences,
    getShiftPreferencesByShiftId,
    replaceShiftPreferences
} = require('../services/shiftService');
const { getWorkerByUserId, getWorkerHospital } = require('../services/workerService');
const supabase = require('../config/supabase');

async function handleExpireOldShifts(req, res) {
    try {
        const today = new Date().toISOString().split('T')[0];
        console.log('📆 Hoy es:', today);

        const { data: candidates, error: readError } = await supabase
            .from('shifts')
            .select('*')
            .lt('date', today)
            .eq('state', 'published');

        if (readError) throw new Error(readError.message);

        console.log('🟡 Candidatos a expirar:', candidates);

        const { error: updateError } = await supabase
            .from('shifts')
            .update({ state: 'expired' })
            .lt('date', today)
            .eq('state', 'published');

        if (updateError) throw new Error(updateError.message);

        res.json({ success: true, message: 'Turnos expirados actualizados' });
    } catch (err) {
        console.error('❌ Error al caducar turnos:', err.message);
        res.status(500).json({ success: false, message: err.message });
    }
}


async function handleCreateShift(req, res) {
    try {
        const userId = req.user.sub;
        const worker = await getWorkerByUserId(userId);
        if (!worker) return res.status(404).json({ success: false, message: 'Worker not found' });

        const hospitalInfo = await getWorkerHospital(worker.worker_id);
        const hospital = hospitalInfo?.hospital_id;
        if (!hospital) return res.status(400).json({ success: false, message: 'No hospital assigned to worker' });

        const {
            date,
            shift_type,
            shift_label,
            speciality_id,
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
            shift_label,
            state: 'published',
        });
        console.log('🟢 Shift creado:', newShift);

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
async function handleGetShiftById(req, res) {
    const shiftId = req.params.id;

    const { data, error } = await supabase
        .from('shifts')
        .select('*')
        .eq('shift_id', shiftId)
        .single();

    if (error) return res.status(404).json({ success: false, message: error.message });
    res.json({ success: true, data });
}

async function handleUpdateShift(req, res) {
    try {
        const userId = req.user?.sub;
        const shiftId = req.params.id;
        const updates = req.body;

        const updated = await updateShift(shiftId, updates, userId);
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

        const hospital = await getWorkerHospital(worker.worker_id);
        if (!hospital) return res.status(404).json({ success: false, message: 'Hospital not found' });

        const shifts = await getHospitalShifts(hospital.hospital_id, worker.worker_id, worker.worker_type_id);
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
    handleExpireOldShifts
};

