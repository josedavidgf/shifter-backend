const workerService = require('../services/workerService');
const supabase = require('../config/supabase');

async function handleGetWorkerStats(req, res) {
  try {
    const userId = req.user.sub;
    const worker = await workerService.getWorkerByUserId(userId);
    if (!worker) return res.status(404).json({ success: false, message: 'Worker not found' });

    const stats = await workerService.getWorkerStats(worker.worker_id);
    res.json({ success: true, data: stats });
  } catch (err) {
    console.error('❌ Error al obtener stats:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
}

// Obtener todos los trabajadores
const getAllWorkers = async (req, res) => {
  try {
    const workers = await workerService.getAllWorkers();
    res.json({ success: true, data: workers });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Obtener un trabajador por ID
const getWorkerById = async (req, res) => {
  try {
    const worker = await workerService.getWorkerById(req.params.id);
    res.json({ success: true, data: worker });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Crear trabajador
const createWorker = async (req, res) => {
  try {
    if (!req.user) {
      console.error('❌ Usuario no autenticado');
      return res.status(401).json({ success: false, message: 'Usuario no autenticado' });
    }
    console.log('👤 Usuario autenticado:', req.user);
    console.log('👤 Datos del trabajador:', req.body);
    const { workerTypeId } = req.body;

    // Validación básica
    if (!workerTypeId) {
      console.error('❌ Campos obligatorios faltantes:', { workerTypeId });
      return res.status(400).json({ success: false, message: 'Faltan datos obligatorios' });
    }
    console.log('🧪 Guardando trabajador:', workerTypeId);
    // Inspección de entrada
    //console.log('📨 Body recibido:', { name, surname, workerType });
    //console.log('🔐 Usuario autenticado:', req.user);

    // Preparación de datos
    const newWorker = {
      user_id: req.user.sub,
      email: req.user.email,
      state: 'active',
      worker_type_id: workerTypeId,
      onboarding_completed: false
    };

    console.log('🧪 Datos del trabajador:', newWorker);

    //console.log('📤 Insertando en Supabase:', newWorker);

    const { data, error } = await supabase
      .from('workers')
      .insert(newWorker)
      .select();

    if (error) {
      console.error('❌ Error al insertar en Supabase:', error);
      return res.status(500).json({ success: false, message: error.message });
    }

    //console.log('✅ Trabajador creado:', data);
    res.status(201).json({ success: true, worker: data[0] });

  } catch (err) {
    console.error('❌ Error inesperado en createWorker:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};
const createWorkerHospital = async (req, res) => {
  const { workerId, hospitalId } = req.body;

  if (!workerId || !hospitalId) {
    return res.status(400).json({ success: false, message: 'Missing workerId or hospitalId' });
  }

  //console.log('🧪 Guardando worker-hospital:', { workerId, hospitalId });

  const { data, error } = await supabase
    .from('workers_hospitals')
    .insert([{ worker_id: workerId, hospital_id: hospitalId, state: 'active' }])
    .select();

  if (error) {
    console.error('❌ Supabase insert error:', error.message);
    return res.status(500).json({ success: false, message: error.message });
  }

  res.status(201).json({ success: true, data });
};


const createWorkerSpeciality = async (req, res) => {
  const { workerId, specialityId, qualificationLevel, experienceYears } = req.body;
  console.log('🧪 Guardando worker-speciality 1:', { workerId, specialityId, qualificationLevel, experienceYears });
  if (!workerId || !specialityId || !qualificationLevel || !experienceYears) {
    console.error('❌ Campos obligatorios faltantes:', { workerId, specialityId, qualificationLevel });
    return res.status(400).json({ success: false, message: 'Missing required fields' });
  }
  //console.log('🧪 Guardando worker-speciality 2:', { workerId, specialityId, qualificationLevel, experienceYears });
  const { data, error } = await supabase
    .from('workers_specialities')
    .insert([{
      worker_id: workerId,
      speciality_id: specialityId,
      qualification_level: qualificationLevel,
      experience_years: experienceYears
    }])
    .select();

  if (error) {
    console.error('❌ Supabase insert error:', error.message);
    return res.status(500).json({ success: false, message: error.message });
  }

  res.status(201).json({ success: true, data });
};


const getMyWorkerProfile = async (req, res) => {
  const userId = req.user?.sub;

  if (!userId) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }

  try {
    const worker = await workerService.getWorkerByUserId(userId);
    return res.status(200).json({ success: true, data: worker });
  } catch (err) {
    console.error('❌ Error al obtener el worker:', err.message);
    return res.status(500).json({ success: false, message: err.message });
  }
};

const checkWorkerOnboardingCompletion = async (req, res) => {
  const userId = req.user?.sub;
  if (!userId) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }

  // Obtener worker_id
  const { data: worker, error: workerError } = await supabase
    .from('workers')
    .select('worker_id')
    .eq('user_id', userId)
    .single();

  if (workerError || !worker) {
    return res.status(404).json({ success: false, message: 'Worker not found' });
  }

  const workerId = worker.worker_id;
  //console.log('👤 Worker ID:', workerId);
  // Verificar hospital
  const { data: hospitals } = await supabase
    .from('workers_hospitals')
    .select('id')
    .eq('worker_id', workerId);
  //console.log('🏥 Hospital:', hospitals);
  // Verificar especialidad
  const { data: specialities } = await supabase
    .from('workers_specialities')
    .select('id')
    .eq('worker_id', workerId);
  //console.log('🔬 Especialidad:', specialities);
  res.status(200).json({
    success: true,
    data: {
      hasHospital: hospitals?.length > 0,
      hasSpeciality: specialities?.length > 0,
    },
  });
};




// Actualizar un trabajador
const updateWorker = async (req, res) => {
  try {
    const worker = await workerService.updateWorker(req.params.id, req.body);
    res.json({ success: true, data: worker });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Eliminar un trabajador
const deleteWorker = async (req, res) => {
  try {
    const worker = await workerService.deleteWorker(req.params.id);
    res.json({ success: true, data: worker });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const getFullWorkerProfile = async (req, res) => {
  const userId = req.user?.sub;
  if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

  // 1. Buscar el worker
  const { data: worker, error: wError } = await supabase
    .from('workers')
    .select('*')
    .eq('user_id', userId)
    .single();
  //console.log('👤 Worker profile:', worker);
  if (wError || !worker) return res.status(404).json({ success: false, message: 'Worker not found' });

  const workerId = worker.worker_id;
  //console.log('👤 Worker ID:', workerId);
  // 2. Buscar hospital
  const { data: workerHospitals } = await supabase
    .from('workers_hospitals')
    .select('hospital_id')
    .eq('worker_id', workerId);
  //console.log('🏥 Hospital profile:', workerHospitals);
  const hospitalId = workerHospitals?.[0]?.hospital_id || null;
  //console.log('🏥 Hospital ID:', hospitalId);

  // 3. Buscar especialidad
  const { data: workerSpecialities } = await supabase
    .from('workers_specialities')
    .select('speciality_id, qualification_level')
    .eq('worker_id', workerId);
  const specialityId = workerSpecialities?.[0]?.speciality_id || null;
  //('🔬 Speciality profile:', workerSpecialities);
  const qualificationLevel = workerSpecialities?.[0]?.qualification_level || null;
  //console.log('🔬 Speciality ID:', specialityId);
  res.status(200).json({
    success: true,
    data: {
      workerId,
      worker,
      hospitalId,
      specialityId,
      qualificationLevel,
    },
  });
};

const updateWorkerInfo = async (req, res) => {
  const userId = req.user?.sub;
  const { name, surname, mobile_phone, mobile_country_code } = req.body;

  const updateData = {};
  if (name !== undefined) updateData.name = name;
  if (surname !== undefined) updateData.surname = surname;
  if (mobile_phone !== undefined && mobile_phone.trim() !== '') updateData.mobile_phone = mobile_phone.trim();
  if (mobile_country_code !== undefined && mobile_country_code.trim() !== '') updateData.mobile_country_code = mobile_country_code.trim();

  const { data: worker } = await supabase
    .from('workers')
    .select('worker_id')
    .eq('user_id', userId)
    .single();

  const { error } = await supabase
    .from('workers')
    .update(updateData)
    .eq('worker_id', worker.worker_id);

  if (error) return res.status(400).json({ success: false, message: error.message });

  res.status(200).json({ success: true });
};

const updateWorkerHospital = async (req, res) => {
  const userId = req.user?.sub;
  const { hospital_id } = req.body;

  const { data: worker } = await supabase
    .from('workers')
    .select('worker_id')
    .eq('user_id', userId)
    .single();

  const { error: delErr } = await supabase
    .from('workers_hospitals')
    .delete()
    .eq('worker_id', worker.worker_id);

  const { error: insErr } = await supabase
    .from('workers_hospitals')
    .insert({ worker_id: worker.worker_id, hospital_id });

  if (delErr || insErr)
    return res.status(400).json({ success: false, message: 'Error updating hospital' });

  res.status(200).json({ success: true });
};
const updateWorkerSpeciality = async (req, res) => {
  const { speciality_id, qualification_level, experience_years } = req.body;
  const userId = req.user.sub;
  console.log('AQUIIIII');
  console.log('👤 User ID:', userId);
  console.log('👤 Request body:', req.body);
  // Buscar el worker actual
  const { data: worker, error: workerError } = await supabase
    .from('workers')
    .select('worker_id')
    .eq('user_id', userId)
    .single();

  if (workerError || !worker) {
    return res.status(404).json({ success: false, message: 'Worker not found' });
  }
  console.log('👤 Worker ID:', worker.worker_id);
  const { data: currentSpec, error: specError } = await supabase
    .from('workers_specialities')
    .select('*')
    .eq('worker_id', worker.worker_id)
    .maybeSingle();

  if (specError) {
    return res.status(500).json({ success: false, message: 'Error fetching current speciality' });
  }

  if (!currentSpec) {
    console.log('🔍 No hay especialidad actual: se insertará nueva');
  }
  console.log('👤 Current speciality:', currentSpec);

  // Si no hay ningún campo a modificar, responde con éxito
  if (
    speciality_id === undefined &&
    qualification_level === undefined &&
    experience_years === undefined
  ) {
    return res.status(200).json({ success: true, message: 'No changes submitted' });
  }
  console.log('👤 New speciality:', { speciality_id, qualification_level, experience_years });

  // Determinar si hay cambios reales
  const changes = {};
  if (speciality_id !== undefined && speciality_id !== currentSpec.speciality_id) {
    changes.speciality_id = speciality_id;
  }
  if (qualification_level !== undefined && qualification_level !== currentSpec.qualification_level) {
    changes.qualification_level = qualification_level;
  }
  if (experience_years !== undefined && experience_years !== currentSpec.experience_years) {
    changes.experience_years = experience_years;
  }
  console.log('👤 Changes detected:', changes);
  if (Object.keys(changes).length === 0) {
    return res.status(200).json({ success: true, message: 'No changes detected' });
  }
  console.log('👤 Updating speciality:', changes);
  // Actualizar solo los campos modificados
  const { error: updateError } = await supabase
    .from('workers_specialities')
    .update(changes)
    .eq('worker_id', worker.worker_id);

  if (updateError) {
    return res.status(400).json({ success: false, message: 'Error updating speciality' });
  }
  console.log('👤 Speciality updated successfully');
  return res.status(200).json({ success: true });
};


const completeOnboarding = async (req, res) => {
  try {
    const userId = req.user.sub;

    const { error } = await supabase
      .from('workers')
      .update({ onboarding_completed: true })
      .eq('user_id', userId);

    if (error) throw new Error(error.message);

    res.status(200).json({ success: true });
  } catch (err) {
    console.error('Error marcando onboarding como completo:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};




module.exports = {
  getAllWorkers,
  getWorkerById,
  createWorker,
  updateWorker,
  deleteWorker,
  createWorkerSpeciality,
  createWorkerHospital,
  getMyWorkerProfile,
  checkWorkerOnboardingCompletion,
  getFullWorkerProfile,
  updateWorkerInfo,
  updateWorkerHospital,
  updateWorkerSpeciality,
  handleGetWorkerStats,
  completeOnboarding
};
