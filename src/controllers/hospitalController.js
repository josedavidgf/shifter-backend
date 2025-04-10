const supabase = require('../config/supabase');

const getAllHospitals = async (req, res) => {
  const { data, error } = await supabase.from('hospitals').select('*');

  if (error) {
    console.error('❌ Error al obtener hospitales:', error.message);
    return res.status(500).json({ success: false, message: error.message });
  }

  res.status(200).json({ success: true, data });
};

module.exports = { getAllHospitals };
