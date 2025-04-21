const supabase = require('../config/supabase');

// Crear una nueva preferencia
async function createSwapPreference(preferenceData) {
  const { data, error } = await supabase
    .from('swap_preferences')
    .insert([preferenceData])
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

// Obtener las preferencias del usuario
async function getMySwapPreferences(workerId) {
  const { data, error } = await supabase
    .from('swap_preferences')
    .select('*')
    .eq('worker_id', workerId)
    .gte('date', today) // ⚡ Solo preferencias futuras o de hoy
    .order('date', { ascending: true });

  if (error) throw new Error(error.message);
  return data;
}

// Eliminar una preferencia (soft delete opcional en el futuro)
 async function deleteSwapPreference(preferenceId) {
  const { error } = await supabase
    .from('swap_preferences')
    .delete()
    .eq('preference_id', preferenceId);

  if (error) throw new Error(error.message);
}

module.exports = {
    createSwapPreference,
    getMySwapPreferences,
    deleteSwapPreference
  };
  