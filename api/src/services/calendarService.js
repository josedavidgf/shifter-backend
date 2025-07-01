const supabase = require('../config/supabase');

/**
 * Obtiene los turnos de monthly_schedules para un array de workerIds y un mes concreto
 * @param {string[]} workerIds
 * @param {number} year
 * @param {number} month (1-12)
 */
async function getMonthlySchedules(workerIds, year, month) {
  if (!Array.isArray(workerIds) || workerIds.length === 0) return [];
  
  // Calcular el primer día del mes
  const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
  
  // Calcular el último día del mes
  const lastDay = new Date(year, month, 0).getDate(); // 0 como día nos da el último día del mes anterior
  const endDate = `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
  
  const { data, error } = await supabase
    .from('monthly_schedules')
    .select('*')
    .in('worker_id', workerIds)
    .gte('date', startDate)
    .lte('date', endDate);
  if (error) throw error;
  return data;
}

module.exports = {
  getMonthlySchedules,
}; 