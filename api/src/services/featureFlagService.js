const supabase = require('../config/supabase');

async function isFeatureEnabled(featureName, workerId, hospitalId) {
  const { data, error } = await supabase
    .from('feature_flags')
    .select('is_enabled')
    .eq('feature_name', featureName)
    .or(
      [
        `worker_id.eq.${workerId}`,
        `hospital_id.eq.${hospitalId}`,
        `worker_id.is.null,hospital_id.is.null`,
      ].join(',')
    )
    .order('worker_id', { ascending: false })
    .order('hospital_id', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error(`FeatureFlag error: ${featureName}`, error);
    return false;
  }

  return data?.is_enabled ?? false;
}

module.exports = {
  isFeatureEnabled,
};
