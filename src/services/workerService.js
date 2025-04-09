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

module.exports = {
  getAllWorkers,
  getWorkerById,
  createWorker,
  updateWorker,
  deleteWorker,
};
