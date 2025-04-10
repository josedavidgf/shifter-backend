const supabase = require('../config/supabase');

const getAllSpecialities = async (req, res) => {
  const { data, error } = await supabase.from('specialities').select('*');

  if (error) {
    console.error('❌ Error al obtener especialidades:', error.message);
    return res.status(500).json({ success: false, message: error.message });
  }

  res.status(200).json({ success: true, data });
};

module.exports = { getAllSpecialities };
