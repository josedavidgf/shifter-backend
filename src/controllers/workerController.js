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
async function createWorker(req, res) {
    try {
        const { name, surname, worker_type_id } = req.body;

        // Verificar campos obligatorios
        if (!name || !surname || !workerType) {
            return res.status(400).json({ success: false, message: 'Faltan campos obligatorios' });
        }

        const { data, error } = await supabase
            .from('workers')
            .insert([{
                name,
                surname,
                worker_type_id,
                user_id: user.id,
                state: 'active'
            }]);

        if (error) throw new Error(error.message);

        res.status(201).json({ success: true, data });
    } catch (err) {
        console.error('❌ Error al crear el trabajador:', err.message);
        res.status(500).json({ success: false, message: err.message });
    }
}



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
