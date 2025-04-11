const {
    createShift,
    getShiftsByWorkerId,
    updateShift,
    removeShift,
    getHospitalShifts,
    createShiftPreferences } = require('../services/shiftService');
const { getWorkerByUserId, getWorkerHospital } = require('../services/workerService');
const supabase = require('../config/supabase');


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
            preferences // 👈 importante: recogemos esto también
        } = req.body;

        if (!speciality_id) {
            return res.status(400).json({ success: false, message: 'speciality_id is required' });
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
        console.log('🟢 Preferencias de turno creadas:', preferences);
        res.status(201).json({ success: true, data: newShift });
    } catch (err) {
        console.error('❌ Shift creation error:', err.message);
        res.status(500).json({ success: false, message: err.message });
    }
}


async function handleGetMyShifts(req, res) {
    try {
        const userId = req.user?.sub; // O req.user.id si lo tienes así
        console.log('🟡 userId updateShift:', userId);
        const worker = await getWorkerByUserId(userId);
        console.log('🟡 worker updateShift:', worker);
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
        console.log('🟡 userId:', userId);
        const shiftId = req.params.id;
        console.log('🟡 shiftId:', shiftId);
        const updates = req.body;
        console.log('🟡 Datos a actualizar:', updates);

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
        console.log('🟡 userId shifts:', userId);
        const worker = await getWorkerByUserId(userId);
        if (!worker) return res.status(404).json({ success: false, message: 'Worker not found' });

        const hospital = await getWorkerHospital(worker.worker_id);
        if (!hospital) return res.status(404).json({ success: false, message: 'Hospital not found' });

        const shifts = await getHospitalShifts(hospital.hospital_id, worker.worker_id);
        res.json({ success: true, data: shifts });
    } catch (err) {
        console.error('❌ Error al obtener turnos del hospital:', err.message);
        res.status(500).json({ success: false, message: err.message });
    }
}

module.exports = {
    handleCreateShift,
    handleGetMyShifts,
    handleUpdateShift,
    handleGetShiftById,
    handleRemoveShift,
    handleGetHospitalShifts
};

