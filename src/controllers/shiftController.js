const { createShift , getShiftsByWorkerId, updateShift} = require('../services/shiftService');
const { getWorkerByUserId, getWorkerHospital} = require('../services/workerService');
const supabase = require('../config/supabase');


async function handleCreateShift(req, res) {
  try {
    console.log('✅ Entrando en handleCreateShift');
    const userId = req.user.sub; // ✅ correcto, el campo es id
    console.log('🟡 userId:', userId);
    const worker = await getWorkerByUserId(userId);
    const workerId = worker.worker_id;
    
    console.log('🟡 worker:', worker);
    console.log('🟡 workerId:', worker.worker_id);
    if (!worker) return res.status(404).json({ success: false, message: 'Worker not found' });

    const hospitalInfo = await getWorkerHospital(workerId);
    const hospital = hospitalInfo.hospital_id;
    console.log('🟡 hospital:', hospital);
    if (!hospital) return res.status(400).json({ success: false, message: 'No hospital assigned to worker' });
    
    const { 
        date, 
        /* start_time, 
        end_time,  */
        shift_type, 
        shift_label ,
        speciality_id
    } = req.body;
    console.log('🟡 Datos recibidos:', {
      date,
      /* start_time,
      end_time, */
      shift_type,
      shift_label,
      speciality_id,
    });

    if (!speciality_id) {
        return res.status(400).json({ success: false, message: 'speciality_id is required' });
      }

    // Log defensivo
    console.log('🟡 Datos a insertar:', {
      worker_id: workerId,
      hospital_id: hospital,
      speciality_id,
      date,
      /* start_time,
      end_time, */
      shift_type,
      shift_label,
    });

    const newShift = await createShift({
      worker_id: worker.worker_id,
      hospital_id: hospital,
      speciality_id,
      date,
      /* start_time,
      end_time, */
      shift_type,
      shift_label,
    });

    res.json({ success: true, data: newShift });

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

module.exports = { 
    handleCreateShift,
    handleGetMyShifts,
    handleUpdateShift,
    handleGetShiftById
};

