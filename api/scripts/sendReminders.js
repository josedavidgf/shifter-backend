// sendReminders.js (versión simplificada con monthly_schedules como fuente única)
require('dotenv').config();
const supabase = require('../src/config/supabase');
const { sendMultiReminderEmail } = require('../src/services/emailService');
const { groupBy } = require('lodash'); // agrupar por user_id
const { sendDailyReminderPush } = require('../src/services/pushService');


async function sendShiftReminders() {
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];

  console.log(`📅 Enviando recordatorios de turnos para: ${tomorrow}`);

  // Obtener todos los trabajadores con turnos propios o recibidos para mañana
  const { data: shifts, error } = await supabase
    .from('monthly_schedules')
    .select(`
      worker_id, 
      date, 
      shift_type, 
      source, 
      workers:worker_id (
        email, 
        name, 
        surname, 
        user_id
      )
    `)
    .eq('date', tomorrow);

  if (error) throw new Error('Error obteniendo turnos: ' + error.message);


  // 👇 DECLARAS `reminders` ANTES de usarla
  const reminders = (shifts || [])
    .filter(s => s.workers?.email && s.workers?.user_id)
    .map(s => ({
      user_id: s.workers.user_id,
      to: s.workers.email,
      user: { name: s.workers.name },
      shift: {
        date: s.date,
        shift_type: s.shift_type,
      }
    }));

  const grouped = groupBy(reminders, r => r.user_id);

  console.log(`✉️ Preparados ${reminders.length} recordatorios...`);

  for (const userId in grouped) {
    const group = grouped[userId];
    const user = { id: userId, name: group[0].user.name };
    const to = group[0].to;
    const shifts = group.map(r => r.shift);

    // email
    try {
      await sendMultiReminderEmail(to, shifts, user);
    } catch (err) {
      console.error(`❌ Error enviando a ${to}:`, err.message);
    }

    // push
    try {
      await sendDailyReminderPush(userId, shifts);
    } catch (err) {
      console.error(`❌ Error enviando push a ${userId}:`, err.message);
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
