const supabase = require('../config/supabase');
const { sendSwapAcceptedEmail, sendSwapRejectedEmail } = require('../services/emailService');
const { getShiftWithOwnerEmail } = require('../services/shiftService');
const { getWorkerById } = require('../services/workerService');


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
        shift_label
      )
    `)
    .in('shift_id', shiftIds);

  if (error) throw new Error(error.message);
  return swaps;
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

  if(status === 'rejected') {
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

    // 1. Marcar el turno como intercambiado
    const { error: shiftError } = await supabase
      .from('shifts')
      .update({ state: 'swapped' })
      .eq('shift_id', shiftId);

    if (shiftError) throw new Error('No se pudo actualizar el estado del turno');
    
    // 2. Obtener emails y datos    
    const [shift, requester] = await Promise.all([
      getShiftWithOwnerEmail(shiftId),
      getWorkerById(updatedSwap.requester_id)
    ]);
    // 3. Enviar email al solicitante
    await sendSwapAcceptedEmail(
      requester.user_id,
      requester.email,
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
        worker_id
      )
    `)
    .eq('requester_id', workerId)
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);
  return data;
}



module.exports = {
  createSwap,
  getSwapsForMyShifts,
  getSwapsByRequesterId,
  respondToSwap,
  cancelSwap,
};
