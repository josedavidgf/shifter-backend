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
  
      const { name, surname, workerType } = req.body;
  
      // Validación básica
      if (!name || !surname || !workerType) {
        console.error('❌ Campos obligatorios faltantes:', { name, surname, workerType });
        return res.status(400).json({ success: false, message: 'Faltan datos obligatorios' });
      }
  
      // Inspección de entrada
      //console.log('📨 Body recibido:', { name, surname, workerType });
      //console.log('🔐 Usuario autenticado:', req.user);
  
      // Preparación de datos
      const newWorker = {
        name,
        surname,
        user_id: req.user.sub,
        email: req.user.email,
        state: 'active',
        worker_type_id: workerType
      };
  
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
        .insert([{ worker_id:workerId, hospital_id: hospitalId, state: 'active' }])
        .select();
    
        if (error) {
        console.error('❌ Supabase insert error:', error.message);
        return res.status(500).json({ success: false, message: error.message });
        }
    
        res.status(201).json({ success: true, data });
    };
  
  
  const createWorkerSpeciality = async (req, res) => {
    const { workerId, specialityId, qualificationLevel, experienceYears } = req.body;
    //console.log('🧪 Guardando worker-speciality 1:', { workerId, specialityId, qualificationLevel , experienceYears});
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
            qualification_level: qualificationLevel ,
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
    const { name, surname } = req.body;
  
    const { data: worker } = await supabase
      .from('workers')
      .select('worker_id')
      .eq('user_id', userId)
      .single();
  
    const { error } = await supabase
      .from('workers')
      .update({ name, surname })
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
    const userId = req.user?.sub;
    const { speciality_id, qualification_level } = req.body;
  
    const { data: worker } = await supabase
      .from('workers')
      .select('worker_id')
      .eq('user_id', userId)
      .single();
  
    const { error: delErr } = await supabase
      .from('workers_specialities')
      .delete()
      .eq('worker_id', worker.worker_id);
  
    const { error: insErr } = await supabase
      .from('workers_specialities')
      .insert({ worker_id: worker.worker_id, speciality_id, qualification_level });
  
    if (delErr || insErr)
      return res.status(400).json({ success: false, message: 'Error updating speciality' });
  
    res.status(200).json({ success: true });
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
    handleGetWorkerStats
};
