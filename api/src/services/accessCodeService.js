const supabase = require('../config/supabaseAdmin');

async function getAccessCode(code) {
  const { data, error } = await supabase
    .from('access_codes')
    .select('id, hospital_id, worker_type_id')
    .eq('code', code)
    .single();

  if (error) throw new Error(error.message);
  return data;
}

module.exports = {
  getAccessCode,
};
