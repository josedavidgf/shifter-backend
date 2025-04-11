const { createShift } = require('../services/shiftService');
const { getWorkerByUserId, getWorkerHospital} = require('../services/workerService');

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

module.exports = { handleCreateShift };

