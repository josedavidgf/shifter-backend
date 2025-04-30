const supabase = require('../config/supabase');

async function getSpecialitiesByHospital(hospitalId) {
  console.log('hospitalId service:', hospitalId);
  const { data, error } = await supabase
    .from('hospitals_specialities')
    .select('speciality:speciality_id (speciality_category, speciality_subcategory, speciality_id)')
    .eq('hospital_id', hospitalId);

  console.log('data service:', data);

  if (error) throw new Error(error.message);
  
  if (!data) {
    throw new Error('No se encontraron especialidades para el hospital');
  }
  console.log('data service:', data);
  const response = data.map(row => ({
    speciality_id: row.speciality.speciality_id,
    speciality_category: row.speciality.speciality_category,
    speciality_subcategory: row.speciality.speciality_subcategory,
  }));
  console.log('response service:', response);
  return response;
  
}

  

  module.exports = {
    getSpecialitiesByHospital,
  };