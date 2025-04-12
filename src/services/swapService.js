const supabase = require('../config/supabase');

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
  const { data, error } = await supabase
    .from('swaps')
    .update({ status })
    .eq('swap_id', swapId)
    .in('shift_id', 
      supabase
        .from('shifts')
        .select('shift_id')
        .eq('worker_id', ownerId)
    )
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
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
  getSwapsForMyShifts ,
  getSwapsByRequesterId,
  respondToSwap,
  cancelSwap,
};
