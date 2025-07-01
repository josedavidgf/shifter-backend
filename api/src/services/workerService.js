const supabase = require('../config/supabase'); // cliente normal
const supabaseAdmin = require('../config/supabaseAdmin'); // cliente que bypass RLS

// Obtener todos los trabajadores
async function getAllWorkers() {
  const { data, error } = await supabaseAdmin.from('workers').select('*');
  if (error) throw new Error(error.message);
  return data;
}

// Obtener un trabajador por ID
async function getWorkerById(workerId) {
  const { data, error } = await supabaseAdmin
    .from('workers')
    .select('*')
    .eq('worker_id', workerId)
    .single();
  if (error) throw new Error(error.message);
  return data;
}

// Crear un nuevo trabajador ---- NO ESTOY ENTRANDO AQUÍ
async function createWorker(workerData) {
  try {
    if (!workerData || !workerData.user_id || !workerData.name || !workerData.worker_type_id) {
      console.error('❌ workerData incompleto:', workerData);
      throw new Error('Datos obligatorios faltantes para crear el trabajador');
    }

    //console.log('📤 Insertando worker en Supabase:', workerData);

    const { data, error } = await supabase
      .from('workers')
      .insert([workerData])
      .select('*');

    if (error) {
      console.error('❌ Error al insertar worker en Supabase:', error);
      throw new Error(error.message);
    }

    const createdWorker = data[0];

    console.log('aqui');
    console.log('createdWorker',createdWorker);


    

    return [createdWorker];

  } catch (err) {
    console.error('❌ createWorker error:', err.message);
    throw err;
  }
}

async function getWorkerByUserId(userId) {
  const { data, error } = await supabase
    .from('workers')
    .select(`
      *,
      worker_types ( worker_type_name ),
      workers_hospitals ( hospital_id, hospitals ( name ) ),
      workers_specialities ( speciality_id, specialities ( speciality_category ) )
    `)
    .eq('user_id', userId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data;
}



// Actualizar un trabajador por ID
async function updateWorker(workerId, workerData) {
  const { data, error } = await supabase
    .from('workers')
    .update({
      ...workerData,
      updated_at: new Date().toISOString()
    })
    .eq('worker_id', workerId)
    .select('*');
  if (error) throw new Error(error.message);
  return data;
}

// Eliminar un trabajador por ID (marcar como removed)
async function deleteWorker(workerId) {
  const { data, error } = await supabase
    .from('workers')
    .update({ 
      state: 'removed',
      updated_at: new Date().toISOString()
    })
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
  return data;
}

async function getUsersForPublishedShift({ hospital_id, worker_type_id, speciality_id }) {

  const { data, error } = await supabase
    .rpc('get_eligible_users_for_shift', {
      hospital_id,
      worker_type_id,
      speciality_id,
    });

  if (error) throw new Error(error.message);

  return data;
}



async function getWorkerStats(workerId) {
  const publishedShiftsQuery = supabaseAdmin
    .from('shifts')
    .select('shift_id', { count: 'exact' })
    .eq('worker_id', workerId)
    .eq('state', 'published');

  const swappedShiftsQuery = supabaseAdmin
    .from('shifts')
    .select('shift_id', { count: 'exact' })
    .eq('worker_id', workerId)
    .eq('state', 'swapped');

  const swapsProposedQuery = supabaseAdmin
    .from('swaps')
    .select('swap_id', { count: 'exact' })
    .eq('requester_id', workerId)
    .eq('status', 'proposed');

  const swapsAcceptedQuery = supabaseAdmin
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

async function getCoworkersCount({ hospitalId, workerTypeId, specialityId }) {
  // 1. Obtener los worker_id que están en ese hospital
  const { data: hospitalWorkers, error: error1 } = await supabaseAdmin
    .from('workers_hospitals')
    .select('worker_id')
    .eq('hospital_id', hospitalId)
    .eq('state', 'active');

  if (error1 || !hospitalWorkers) return 0;

  const workerIds = hospitalWorkers.map(w => w.worker_id);

  // 2. Filtrar los workers que coincidan en type y speciality
  const { count, error: error2 } = await supabaseAdmin
    .from('workers')
    .select('*', { count: 'exact', head: true })
    .in('worker_id', workerIds)
    .eq('worker_type_id', workerTypeId)
    .in('worker_id',
      (await supabaseAdmin
        .from('workers_specialities')
        .select('worker_id')
        .eq('speciality_id', specialityId)).data?.map(w => w.worker_id) || []
    );

  if (error2) return 0;

  return count || 0;
}

// Obtener datos del supervisor por user_id
async function getSupervisorByUserId(userId) {
  const { data, error } = await supabaseAdmin
    .from('supervisors')
    .select('hospital_id, worker_type_id, speciality_id')
    .eq('user_id', userId)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data;
}

// Obtener workers supervisados con filtros, búsqueda, orden y paginación
async function getSupervisedWorkers({ hospital_id, worker_type_id, speciality_id, page, limit, sortBy, order, search }) {
  // 1. Obtener los worker_id que están en ese hospital y cumplen los filtros
  let query = supabaseAdmin
    .from('workers')
    .select('worker_id, name, surname, state', { count: 'exact' })
    .eq('worker_type_id', worker_type_id)
    .eq('state', 'active');

  // Filtrar por hospital
  if (hospital_id) {
    // Obtener los worker_id de ese hospital
    const { data: hospitalWorkers, error: error1 } = await supabaseAdmin
      .from('workers_hospitals')
      .select('worker_id')
      .eq('hospital_id', hospital_id)
      .eq('state', 'active');
    if (error1) throw new Error(error1.message);
    const workerIds = hospitalWorkers.map(w => w.worker_id);
    query = query.in('worker_id', workerIds);
  }

  // Filtrar por speciality
  if (speciality_id) {
    // Obtener los worker_id de esa especialidad
    const { data: specialityWorkers, error: error2 } = await supabaseAdmin
      .from('workers_specialities')
      .select('worker_id')
      .eq('speciality_id', speciality_id);
    if (error2) throw new Error(error2.message);
    const workerIds = specialityWorkers.map(w => w.worker_id);
    query = query.in('worker_id', workerIds);
  }

  // Búsqueda por nombre o apellidos
  if (search) {
    query = query.or(`name.ilike.%${search}%,surname.ilike.%${search}%`);
  }

  // Ordenación
  if (sortBy === 'surname') {
    query = query.order('surname', { ascending: order === 'asc' });
  } else {
    query = query.order('name', { ascending: order === 'asc' });
  }

  // Paginación
  const from = (page - 1) * limit;
  const to = from + limit - 1;
  query = query.range(from, to);

  const { data, error, count } = await query;
  if (error) throw new Error(error.message);

  const total = count || 0;
  const totalPages = Math.ceil(total / limit);

  return {
    data,
    total,
    page,
    totalPages
  };
}

module.exports = {
  getAllWorkers,
  getWorkerById,
  createWorker,
  getCoworkersCount,
  updateWorker,
  deleteWorker,
  getWorkerByUserId,
  getWorkerHospital,
  getWorkerStats,
  getUsersForPublishedShift,
  getSupervisorByUserId,
  getSupervisedWorkers
};
