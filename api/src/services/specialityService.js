const supabase = require('../config/supabase');

async function getSpecialitiesByHospital(hospitalId) {
  const { data, error } = await supabase
    .from('hospitals_specialities')
    .select('speciality:speciality_id (speciality_category, speciality_id)')
    .eq('hospital_id', hospitalId);


  if (error) throw new Error(error.message);
  
  if (!data) {
    throw new Error('No se encontraron especialidades para el hospital');
  }
  const response = data.map(row => ({
    speciality_id: row.speciality.speciality_id,
    speciality_category: row.speciality.speciality_category,
  }));
  return response;
  
}

  

  module.exports = {
    getSpecialitiesByHospital,
  };