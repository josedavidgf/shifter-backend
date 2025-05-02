const supabase = require('../config/supabase');
const { sendSwapAcceptedEmail, sendSwapRejectedEmail } = require('./emailService');
const { getShiftWithOwnerEmail } = require('./shiftService');
const { getWorkerById } = require('./workerService');
const { getMySwapPreferences, deleteSwapPreference } = require('./swapPreferencesService');
const { applySwapToMonthlySchedule } = require('./swapScheduleService');


// TODO: Verificar si esta función sigue siendo necesaria después del MVP.
async function createSwap(data) {
  const { data: swap, error } = await supabase
    .from('swaps')
    .insert(data)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return swap;
}

async function getSwapsForMyShifts(workerId) {
  const { data: myShifts, error: errShifts } = await supabase
    .from('shifts')
    .select('shift_id')
    .eq('worker_id', workerId);
  if (errShifts) throw new Error(errShifts.message);

  const shiftIds = myShifts.map(s => s.shift_id);
  if (shiftIds.length === 0) return [];

  const { data: swaps, error } = await supabase
    .from('swaps')
    .select(`
      *,
      shift:shift_id (
        shift_id,
        date,
        shift_type,
        shift_label,
        shift_comments
      )
    `)
    .in('shift_id', shiftIds);
  if (error) throw new Error(error.message);
  return swaps;
}

async function getSwapsAcceptedForMyShifts(workerId) {
  // 1. Buscar swaps donde worker es OWNER de turno (como tienes ahora)
  const { data: myShifts, error: errShifts } = await supabase
    .from('shifts')
    .select('shift_id')
    .eq('worker_id', workerId);
  if (errShifts) throw new Error(errShifts.message);

  const shiftIds = myShifts.map(s => s.shift_id);

  const { data: swapsAsOwner, error: errOwner } = await supabase
    .from('swaps')
    .select(`
      *,
      shift:shift_id (
        shift_id,
        worker_id,
        date,
        shift_type,
        shift_label,
        shift_comments,
         worker: worker_id (
        worker_id,
        name,
        surname,
        mobile_country_code,
        mobile_phone
        )
      ),
      requester:requester_id (
        worker_id,
        name,
        surname,
        mobile_country_code,
        mobile_phone
      )
    `)
    .eq('status', 'accepted')
    .in('shift_id', shiftIds);
  if (errOwner) throw new Error(errOwner.message);

  // 2. Buscar swaps donde worker es REQUESTER
  const { data: swapsAsRequester, error: errRequester } = await supabase
    .from('swaps')
    .select(`
      *,
      shift:shift_id (
        shift_id,
        worker_id,
        date,
        shift_type,
        shift_label,
        shift_comments,
        worker: worker_id (
        worker_id,
        name,
        surname,
        mobile_country_code,
        mobile_phone
      )
    )
    `)
    .eq('status', 'accepted')
    .eq('requester_id', workerId);
  if (errRequester) throw new Error(errRequester.message);

  // 3. Combinar ambos resultados
  return [...(swapsAsOwner || []), ...(swapsAsRequester || [])];
}


async function cancelSwap(swapId, requesterId) {
  const { data, error } = await supabase
    .from('swaps')
    .update({ status: 'cancelled' })
    .eq('swap_id', swapId)
    .eq('requester_id', requesterId)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

async function respondToSwap(swapId, status, ownerId) {
  const { data: shifts, error: shiftQueryError } = await supabase
    .from('shifts')
    .select('shift_id')
    .eq('worker_id', ownerId);

  if (shiftQueryError) throw new Error(shiftQueryError.message);
  const shiftIds = shifts.map(s => s.shift_id);

  const { data: updatedSwap, error } = await supabase
    .from('swaps')
    .update({ status })
    .eq('swap_id', swapId)
    .in('shift_id', shiftIds)
    .select()
    .single();

  if (error) throw new Error(error.message);

  if (status === 'rejected') {
    const shiftId = updatedSwap.shift_id;
    const { error: shiftError } = await supabase
      .from('shifts')
      .update({ state: 'rejected' })
      .eq('shift_id', shiftId);

    const [shift, requester] = await Promise.all([
      getShiftWithOwnerEmail(updatedSwap.shift_id),
      getWorkerById(updatedSwap.requester_id)
    ]);

    await sendSwapRejectedEmail(
      requester.user_id,
      requester.email,
      shift,
      updatedSwap
    );
  }

  if (status === 'accepted') {
    const shiftId = updatedSwap.shift_id;

    const { error: shiftError } = await supabase
      .from('shifts')
      .update({ state: 'swapped' })
      .eq('shift_id', shiftId);

    if (shiftError) throw new Error('No se pudo actualizar el estado del turno');

    const { data: fullShift, error: shiftFetchError } = await supabase
      .from('shifts')
      .select('shift_id, date, shift_type, worker_id')
      .eq('shift_id', shiftId)
      .single();

    if (shiftFetchError) throw new Error('No se pudo obtener el turno para actualizar calendario');

    // Enriquecemos el swap
    updatedSwap.shift = fullShift;

    // 🧠 Aplicamos lógica de calendarización
    console.log('updatedSwap:', updatedSwap)
    await applySwapToMonthlySchedule(updatedSwap);

    const [shift, requester] = await Promise.all([
      getShiftWithOwnerEmail(shiftId),
      getWorkerById(updatedSwap.requester_id)
    ]);

    await sendSwapAcceptedEmail(
      requester.user_id,
      requester.email,
      requester.name,
      requester.surname,
      shift,
      updatedSwap
    );
  }

  return updatedSwap;
}


async function getSwapsByRequesterId(workerId) {
  const { data, error } = await supabase
    .from('swaps')
    .select(`
      *,
      shift:shift_id (
        shift_id,
        date,
        shift_type,
        shift_label,
        shift_comments,
        worker_id,
        worker:worker_id (
          name,
          surname,
          email
        )
      )
    `)
    .eq('requester_id', workerId)
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);
  return data;
}

async function getSwapByIdService(swapId, userId) {
  const { data, error } = await supabase
    .from('swaps')
    .select(`
      *,
      shift:shift_id (
        shift_id,
        date,
        shift_type,
        shift_label,
        worker_id,
        worker:worker_id (
          name,
          surname,
          email
        )
      )
    `)
    .eq('swap_id', swapId)
    .single();
  if (error) throw new Error('No se pudo obtener el swap');

  /* if (![data.requester_id, data.shift?.worker_id].includes(userId)) {
    const err = new Error('Acceso no autorizado al intercambio');
    console.log('❌ Acceso no autorizado al intercambio');
    err.status = 403;
    throw err;
  } */
  return data;
}

async function getSwapsByShiftIdService(shiftId) {
  const { data, error } = await supabase
    .from('swaps')
    .select(`
      swap_id,
      status,
      shift_id,
      requester_id,
      offered_date,
      offered_type,
      offered_label,
      swap_comments,
      shift:shift_id (
        shift_id,
        date,
        shift_type,
        shift_label,
        shift_comments,
        worker_id,
        worker:worker_id (
          name,
          surname,
          email
        )
      ),
      requester:requester_id (
        name,
        surname,
        email
      )
    `)
    .eq('shift_id', shiftId)
    .in('status', ['proposed', 'accepted']);

  if (error) throw new Error(error.message);
  return data;
}

async function createSwapWithMatching(data) {
  const { shift_id, requester_id, offered_date, offered_type, offered_label, swap_comments } = data;

  // 1. Crear swap inicialmente como 'proposed'
  const { data: swap, error } = await supabase
    .from('swaps')
    .insert({
      shift_id,
      requester_id,
      offered_date,
      offered_type,
      offered_label,
      swap_comments,
      status: 'proposed'
    })
    .select()
    .single();

  if (error) throw new Error(error.message);

  // 2. Buscar owner del turno
  const { data: shift, error: shiftError } = await supabase
    .from('shifts')
    .select('worker_id, date, shift_type')
    .eq('shift_id', shift_id)
    .single();

  if (shiftError) throw new Error(shiftError.message);

  const ownerWorkerId = shift.worker_id;

  // 3. Buscar preferencias del owner
  const preferences = await getMySwapPreferences(ownerWorkerId);

  const match = preferences.find(pref =>
    pref.date === offered_date &&
    pref.preference_type === offered_type
  );

  if (match) {
    console.log('🟢🔵 Simple Swap automático encontrado');

    // 4. Actualizar swap a 'accepted'
    const { data: updatedSwap, error: updateError } = await supabase
      .from('swaps')
      .update({ status: 'accepted' })
      .eq('swap_id', swap.swap_id)
      .select()
      .single();

    if (updateError) throw new Error(updateError.message);

    // 5. Marcar turno original como intercambiado
    await supabase
      .from('shifts')
      .update({ state: 'swapped' })
      .eq('shift_id', shift_id);

    // 6. Eliminar preferencia cumplida
    await deleteSwapPreference(match.preference_id);

    // 7. Enviar email de aceptación automática
    const requester = await getWorkerById(requester_id);
    const shiftWithEmail = await getShiftWithOwnerEmail(shift_id);

    await sendSwapAcceptedEmail(
      requester.user_id,
      requester.email,
      requester.name,
      requester.surname,
      shiftWithEmail,
      updatedSwap
    );

    // Añadir el turno embebido (como en respondToSwap)
    const { data: fullShift, error: shiftFetchError } = await supabase
      .from('shifts')
      .select('shift_id, date, shift_type, worker_id')
      .eq('shift_id', shift_id)
      .single();

    if (shiftFetchError) throw new Error('No se pudo obtener el turno para aplicar el swap');

    updatedSwap.shift = fullShift;

    // ✅ Aplicar el swap a monthly_schedules
    await applySwapToMonthlySchedule(updatedSwap);

    return updatedSwap;
  }

  console.log('🟡 No hay match automático, swap propuesto');
  return swap;
}

module.exports = {
  createSwapWithMatching,
  createSwap,
  getSwapsForMyShifts,
  getSwapsByRequesterId,
  respondToSwap,
  cancelSwap,
  getSwapByIdService,
  getSwapsByShiftIdService,
  getSwapsAcceptedForMyShifts
};
