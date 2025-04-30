require('dotenv').config();
const supabase = require('../src/config/supabase');
const { sendReminderEmail } = require('../src/services/emailService');

async function sendShiftReminders() {
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
  console.log(`📅 Buscando turnos para enviar recordatorios del día: ${tomorrow}`);

  // 1. Turnos programados (schedules)
  const { data: schedules, error: scheduleError } = await supabase
    .from('schedules')
    .select('worker_id, date, shift_type, workers!inner(email, name)')
    .eq('date', tomorrow);

  if (scheduleError) throw new Error('Error obteniendo schedules: ' + scheduleError.message);

  // 2. Swaps aceptados con turno recibido para mañana
  const { data: swaps, error: swapError } = await supabase
    .from('swaps')
    .select('receiver_id, offered_date, offered_type, receiver:receivers(email, name)')
    .eq('status', 'accepted')
    .eq('offered_date', tomorrow);

  if (swapError) throw new Error('Error obteniendo swaps: ' + swapError.message);

  // 3. Preparar lista combinada
  const reminders = [];

  (schedules || []).forEach((s) => {
    if (s.workers?.email) {
      reminders.push({
        user_id: s.worker_id,
        to: s.workers.email,
        user: { name: s.workers.name },
        shift: {
          date: s.date,
          shift_type: s.shift_type,
        }
      });
    }
  });

  (swaps || []).forEach((s) => {
    if (s.receiver?.email) {
      reminders.push({
        user_id: s.receiver_id,
        to: s.receiver.email,
        user: { name: s.receiver.name },
        shift: {
          date: s.offered_date,
          shift_type: s.offered_type,
        }
      });
    }
  });

  console.log(`✉️ Enviando ${reminders.length} emails de recordatorio...`);

  for (const r of reminders) {
    try {
      await sendReminderEmail(r.to, r.shift, { id: r.user_id, name: r.user.name });
    } catch (err) {
      console.error(`❌ Error enviando a ${r.to}:`, err.message);
    }
  }

  console.log('✅ Recordatorios enviados.');
}

(async () => {
  try {
    await sendShiftReminders();
    process.exit(0);
  } catch (err) {
    console.error('❌ Error en recordatorio de turnos:', err.message);
    process.exit(1);
  }
})();
