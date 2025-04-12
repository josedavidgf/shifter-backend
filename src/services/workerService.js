const supabase = require('../config/supabase');

// Obtener todos los trabajadores
async function getAllWorkers() {
  const { data, error } = await supabase.from('workers').select('*');
  if (error) throw new Error(error.message);
  return data;
}

// Obtener un trabajador por ID
async function getWorkerById(workerId) {
  const { data, error } = await supabase
    .from('workers')
    .select('*')
    .eq('worker_id', workerId)
    .single();
  if (error) throw new Error(error.message);
  return data;
}

// Crear un nuevo trabajador
async function createWorker(workerData) {
  try {
    if (!workerData || !workerData.user_id || !workerData.name || !workerData.worker_type_id) {
      console.error('❌ workerData incompleto:', workerData);
      throw new Error('Datos obligatorios faltantes para crear el trabajador');
    }

    console.log('📤 Insertando worker en Supabase:', workerData);

    const { data, error } = await supabase
      .from('workers')
      .insert([workerData])
      .select('*');

    if (error) {
      console.error('❌ Error al insertar worker en Supabase:', error);
      throw new Error(error.message);
    }

    console.log('✅ Worker insertado correctamente:', data);
    return data;

  } catch (err) {
    console.error('❌ createWorker error:', err.message);
    throw err;
  }
}

async function getWorkerByUserId(userId) {
  const { data, error } = await supabase
    .from('workers')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error) throw new Error(error.message);
  return data;
}



// Actualizar un trabajador por ID
async function updateWorker(workerId, workerData) {
  const { data, error } = await supabase
    .from('workers')
    .update(workerData)
    .eq('worker_id', workerId)
    .select('*');
  if (error) throw new Error(error.message);
  return data;
}

// Eliminar un trabajador por ID (marcar como removed)
async function deleteWorker(workerId) {
  const { data, error } = await supabase
    .from('workers')
    .update({ state: 'removed' })
    .eq('worker_id', workerId)
    .select('*');
  if (error) throw new Error(error.message);
  return data;
}

// Obtener el hospital asociado a un trabajador
async function getWorkerHospital(workerId) {
  const { data, error } = await supabase
    .from('workers_hospitals')
    .select('hospital_id')
    .eq('worker_id', workerId)
    .eq('state', 'active')
    .single();
  if (error) throw new Error(error.message);
  console.log('🟡 Hospital asociado al trabajador:', data.hospital_id);
  return data;
}

async function getWorkerStats(workerId) {
  const publishedShiftsQuery = supabase
    .from('shifts')
    .select('shift_id', { count: 'exact' })
    .eq('worker_id', workerId)
    .eq('state', 'published');

  const swappedShiftsQuery = supabase
    .from('shifts')
    .select('shift_id', { count: 'exact' })
    .eq('worker_id', workerId)
    .eq('state', 'swapped');

  const swapsProposedQuery = supabase
    .from('swaps')
    .select('swap_id', { count: 'exact' })
    .eq('requester_id', workerId)
    .eq('status', 'proposed');

  const swapsAcceptedQuery = supabase
    .from('swaps')
    .select('swap_id', { count: 'exact' })
    .eq('requester_id', workerId)
    .eq('status', 'accepted');

  const [
    publishedShifts,
    swappedShifts,
    swapsProposed,
    swapsAccepted
  ] = await Promise.all([
    publishedShiftsQuery,
    swappedShiftsQuery,
    swapsProposedQuery,
    swapsAcceptedQuery
  ]);

  if (
    publishedShifts.error ||
    swappedShifts.error ||
    swapsProposed.error ||
    swapsAccepted.error
  ) {
    throw new Error('Error en las consultas de métricas');
  }

  return {
    publishedShifts: publishedShifts.count || 0,
    swappedShifts: swappedShifts.count || 0,
    swapsProposed: swapsProposed.count || 0,
    swapsAccepted: swapsAccepted.count || 0,
  };
}


module.exports = {
  getAllWorkers,
  getWorkerById,
  createWorker,
  updateWorker,
  deleteWorker,
  getWorkerByUserId,
  getWorkerHospital,
  getWorkerStats
};
