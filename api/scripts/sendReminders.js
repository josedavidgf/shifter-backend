// sendReminders.js (versión simplificada con monthly_schedules como fuente única)
require('dotenv').config();
const supabase = require('../src/config/supabase');
const { sendReminderEmail } = require('../src/services/emailService');

async function sendShiftReminders() {
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
  console.log(`📅 Enviando recordatorios de turnos para: ${tomorrow}`);

  // Obtener todos los trabajadores con turnos propios o recibidos para mañana
  const { data: shifts, error } = await supabase
    .from('monthly_schedules')
    .select('worker_id, date, shift_type, source, workers:worker_id (email, name, user_id)')
    .eq('date', tomorrow)
    .in('source', ['manual', 'received_swap']);

  if (error) throw new Error('Error obteniendo turnos: ' + error.message);

  const reminders = (shifts || [])
    .filter(s => s.workers?.email)
    .map(s => ({
      user_id: s.workers.user_id,
      to: s.workers.email,
      user: { name: s.workers.name },
      shift: {
        date: s.date,
        shift_type: s.shift_type,
      }
    }));

  console.log(`✉️ Preparados ${reminders.length} recordatorios...`);

  for (const r of reminders) {
    try {
      await sendReminderEmail(r.to, r.shift, { id: r.user_id, name: r.user.name });
    } catch (err) {
      console.error(`❌ Error enviando a ${r.to}:`, err.message);
    }
  }

  console.log('✅ Proceso completado.');
}

(async () => {
  try {
    await sendShiftReminders();
    process.exit(0);
  } catch (err) {
    console.error('❌ Error general en recordatorios:', err.message);
    process.exit(1);
  }
})();
