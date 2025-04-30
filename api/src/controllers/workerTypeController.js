const supabase = require('../config/supabase');

// Obtener todos los tipos de trabajador
async function getWorkerTypes(req, res) {
    try {
        const { data, error } = await supabase.from('worker_types').select('*');
        if (error) throw error;
        res.status(200).json({ success: true, data });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
}

module.exports = {
    getWorkerTypes,
};
