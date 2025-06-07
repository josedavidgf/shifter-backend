// swapScheduleService.js
const supabase = require('../config/supabaseAdmin');
const { getWorkerById } = require('./workerService'); // asegúrate de tenerlo importado

async function applySwapToMonthlySchedule(swap) {
  const { shift, requester_id, offered_date, offered_type, swap_type } = swap;

  if (!shift || !shift.date || !shift.shift_type || !shift.worker_id) {
    throw new Error('El objeto swap.shift está incompleto');
  }

  const ownerId = shift.worker_id;
  const ownerDate = shift.date;
  const ownerType = shift.shift_type;

  const requester = await getWorkerById(requester_id); // 👈 obtenemos nombre y apellidos

  // Paso 1: marcar turno original del owner como traspasado
  await supabase
    .from('monthly_schedules')
    .update({
      source: 'swapped_out',
      swap_id: swap.swap_id,
      related_worker_id: requester_id,
      related_worker_name: requester.name,
      related_worker_surname: requester.surname,
    })
    .eq('worker_id', ownerId)
    .eq('date', ownerDate)
    .eq('shift_type', ownerType);

  // Paso 2: añadir turno recibido por requester
  const owner = await getWorkerById(ownerId); // 👈 también para el reverse

  await supabase
    .from('monthly_schedules')
    .upsert({
      worker_id: requester_id,
      date: ownerDate,
      shift_type: ownerType,
      source: 'received_swap',
      related_worker_id: ownerId,
      related_worker_name: owner.name,
      related_worker_surname: owner.surname,
      swap_id: swap.swap_id,
    }, { onConflict: ['worker_id', 'date', 'shift_type'] });

  if (swap_type === 'return' && offered_date && offered_type) {
    // Paso 3: marcar turno original del requester como traspasado
    await supabase
      .from('monthly_schedules')
      .update({
        source: 'swapped_out',
        swap_id: swap.swap_id,
        related_worker_id: ownerId,
        related_worker_name: owner.name,
        related_worker_surname: owner.surname,
      })
      .eq('worker_id', requester_id)
      .eq('date', offered_date)
      .eq('shift_type', offered_type);

    // Paso 4: añadir turno recibido por owner
    await supabase
      .from('monthly_schedules')
      .upsert({
        worker_id: ownerId,
        date: offered_date,
        shift_type: offered_type,
        source: 'received_swap',
        related_worker_id: requester_id,
        related_worker_name: requester.name,
        related_worker_surname: requester.surname,
        swap_id: swap.swap_id,
      }, { onConflict: ['worker_id', 'date', 'shift_type'] });
  }
}


  
  module.exports = { applySwapToMonthlySchedule }