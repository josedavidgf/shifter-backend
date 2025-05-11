const supabase = require('../config/supabase');
const supabaseAdmin = require('../config/supabaseAdmin'); // cliente que bypass RLS

async function createUserEvent(workerId, type, metadata = {}) {
  return await supabaseAdmin
    .from("user_events")
    .insert([{ worker_id: workerId, type, metadata }]);
}

async function getUserEvents(workerId) {
  return await supabase
    .from("user_events")
    .select("*")
    .eq("worker_id", workerId)
    .order("created_at", { ascending: false });
}

async function markUserEventsAsSeen(workerId) {
  return await supabase
    .from("user_events")
    .update({ seen: true })
    .eq("worker_id", workerId)
    .eq("seen", false);
}

module.exports = {
  createUserEvent,
  getUserEvents,
  markUserEventsAsSeen,
};
