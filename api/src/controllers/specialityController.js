const supabase = require('../config/supabase');
const specialityService = require('../services/specialityService');


const getAllSpecialities = async (req, res) => {
  const { data, error } = await supabase.from('specialities').select('*');

  if (error) {
    console.error('❌ Error al obtener especialidades:', error.message);
    return res.status(500).json({ success: false, message: error.message });
  }

  res.status(200).json({ success: true, data });
};

const getSpecialitiesByHospitalId = async (req, res) => {
  try {
    const { hospitalId } = req.params;
    console.log('hospitalId:', hospitalId);
    const specialities = await specialityService.getSpecialitiesByHospital(hospitalId);
    console.log('Especialidades:', specialities);
    res.status(200).json({ success: true, data: specialities });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getAllSpecialities, getSpecialitiesByHospitalId };
