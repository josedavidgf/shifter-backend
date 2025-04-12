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



module.exports = { 
  createSwap, 
  getSwapsForMyShifts 
};
