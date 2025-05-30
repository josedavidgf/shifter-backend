// swapScheduleService.js
const supabase = require('../config/supabaseAdmin');

/**
 * Actualiza la tabla monthly_schedules tras aceptar un swap.
 * Asigna turno recibido al requester y marca como traspasado el turno original del owner.
 * @param {object} swap - Objeto swap completo (debería incluir shift, requester_id, offered_date, offered_type)
 */
async function applySwapToMonthlySchedule(swap) {
  const { shift, requester_id, offered_date, offered_type, swap_type } = swap;

  if (!shift || !shift.date || !shift.shift_type || !shift.worker_id) {
    throw new Error('El objeto swap.shift está incompleto');
  }

  const ownerId = shift.worker_id;
  const ownerDate = shift.date;
  const ownerType = shift.shift_type;

  // Paso 1: marcar turno original del owner como traspasado
  await supabase
    .from('monthly_schedules')
    .update({
      source: 'swapped_out',
      swap_id: swap.swap_id,
      related_worker_id: requester_id,
    })
    .eq('worker_id', ownerId)
    .eq('date', ownerDate);

  // Paso 2: añadir turno recibido por requester
  await supabase
    .from('monthly_schedules')
    .upsert({
      worker_id: requester_id,
      date: ownerDate,
      shift_type: ownerType,
      source: 'received_swap',
      related_worker_id: ownerId,
      swap_id: swap.swap_id,
    }, { onConflict: ['worker_id', 'date'] });

  // 🚨 Solo si es tipo return, marcamos e insertamos el turno ofrecido
  if (swap_type === 'return' && offered_date && offered_type) {
    // Paso 3: marcar turno original del requester como traspasado
    await supabase
      .from('monthly_schedules')
      .update({
        source: 'swapped_out',
        swap_id: swap.swap_id,
        related_worker_id: ownerId,
      })
      .eq('worker_id', requester_id)
      .eq('date', offered_date);

    // Paso 4: añadir turno recibido por owner
    await supabase
      .from('monthly_schedules')
      .upsert({
        worker_id: ownerId,
        date: offered_date,
        shift_type: offered_type,
        source: 'received_swap',
        related_worker_id: requester_id,
        swap_id: swap.swap_id,
      }, { onConflict: ['worker_id', 'date'] });
  }
}

  
  module.exports = { applySwapToMonthlySchedule }