require('dotenv').config();
const supabaseAdmin = require('../src/config/supabaseAdmin');

async function expireOldShifts() {
  const today = new Date().toISOString().split('T')[0];
  const { error } = await supabaseAdmin
    .from('shifts')
    .update({ state: 'expired' })
    .lt('date', today)
    .eq('state', 'published');

  if (error) throw new Error('Error expirando turnos: ' + error.message);
  console.log('✅ Turnos expirados');
}

async function expireOldSwapPreferences() {
  const today = new Date().toISOString().split('T')[0];
  const { data, error: readError } = await supabaseAdmin
    .from('swap_preferences')
    .select('preference_id')
    .lt('date', today);

  if (readError) throw new Error(readError.message);

  const ids = data.map((d) => d.preference_id);
  if (ids.length === 0) return;

  const { error: deleteError } = await supabaseAdmin
    .from('swap_preferences')
    .delete()
    .in('preference_id', ids);

  if (deleteError) throw new Error(deleteError.message);
  console.log(`🧹 Borradas ${ids.length} swapPreferences antiguas`);
}

(async () => {
  try {
    await expireOldShifts();
    await expireOldSwapPreferences();
    console.log(`🕐 Limpieza ejecutada a: ${new Date().toLocaleString('es-ES', { timeZone: 'Europe/Madrid' })}`);
    process.exit(0);
  } catch (err) {
    console.error('❌ Fallo limpieza:', err.message);
    process.exit(1);
  }
})();
