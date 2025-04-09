const workerService = require('../services/workerService');
const supabase = require('../config/supabase');


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
      console.log('📨 Body recibido:', { name, surname, workerType });
      console.log('🔐 Usuario autenticado:', req.user);
  
      // Preparación de datos
      const newWorker = {
        name,
        surname,
        user_id: req.user.sub,
        email: req.user.email,
        worker_type_id: workerType
      };
  
      console.log('📤 Insertando en Supabase:', newWorker);
  
      const { data, error } = await supabase
        .from('workers')
        .insert(newWorker)
        .select();
  
      if (error) {
        console.error('❌ Error al insertar en Supabase:', error);
        return res.status(500).json({ success: false, message: error.message });
      }
  
      console.log('✅ Trabajador creado:', data);
      res.status(201).json({ success: true, worker: data[0] });
  
    } catch (err) {
      console.error('❌ Error inesperado en createWorker:', err.message);
      res.status(500).json({ success: false, message: err.message });
    }
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

module.exports = {
  getAllWorkers,
  getWorkerById,
  createWorker,
  updateWorker,
  deleteWorker,
};
