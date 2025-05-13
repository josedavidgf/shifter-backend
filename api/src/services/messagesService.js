// backend/services/messagesService.js
const supabaseAdmin = require('../config/supabaseAdmin');

async function markMessagesAsRead(swapId, workerId) {
  const { data, error } = await supabaseAdmin.rpc('mark_messages_as_read', {
    swap_id_param: swapId,
    worker_id_param: workerId,
  });

  if (error) throw new Error(error.message);
  return data;
}

async function getUnreadMessagesPerChat(workerId) {
  const { data, error } = await supabaseAdmin.rpc('get_unread_messages_per_chat', {
    worker_id_param: workerId,
  });

  if (error) throw new Error(error.message);
  return data;
}

module.exports = {
  markMessagesAsRead,
  getUnreadMessagesPerChat,
}