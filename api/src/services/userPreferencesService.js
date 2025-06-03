const supabase = require('../config/supabase');

async function getUserPreferences(userId) {
    const { data, error } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', userId)
        .single();
    //console.log('User preferences retrieved:', data);

    if (error && error.code !== 'PGRST116') throw new Error(error.message);
    return data;
}

async function upsertUserPreferences(userId, preferences) {
    const { data, error } = await supabase        
      .from('user_preferences')
      .upsert({
        user_id: userId,
        receive_emails_swap: preferences.receive_emails_swap,
        receive_emails_reminders: preferences.receive_emails_reminders,
        receive_push_shift_published: preferences.receive_push_shift_published,
        receive_push_swap_proposed: preferences.receive_push_swap_proposed,
        receive_push_swap_responded: preferences.receive_push_swap_responded,
        receive_push_daily_reminder: preferences.receive_push_daily_reminder,
      }, { onConflict: 'user_id' }) // aseguras que actúa como upsert
      .select()
      .single();
  
    if (error) throw new Error(error.message);
    return data;
  }
  

async function shouldSendSwapEmail(userId) {
    const { data, error } = await supabase
      .from('user_preferences')
      .select('receive_emails_swap')
      .eq('user_id', userId)
      .single();
  
    if (error) {
      console.error('❌ Error al obtener preferencias de email:', error.message);
      return false; // Por seguridad: no enviar si no sabemos.
    }
  
    return data.receive_emails_swap === true;
  }
  async function shouldSendReminderEmail(userId) {
    const { data, error } = await supabase
      .from('user_preferences')
      .select('receive_emails_reminders')
      .eq('user_id', userId)
      .single();
  
    if (error) {
      console.error('❌ Error al obtener preferencias de reminder email:', error.message);
      return false;
    }
  
    return data.receive_emails_reminders === true;
  }

  async function shouldSendSwapPushNotification(userId) {
    const { data, error } = await supabase
      .from('user_preferences')
      .select('receive_push_swap_proposed')
      .eq('user_id', userId)
      .single();
  
    if (error) {
      console.error('❌ Error al obtener preferencias de push swap:', error.message);
      return false; // Por seguridad: no enviar si no sabemos.
    }
  
    return data.receive_push_swap_proposed === true;
  }
async function shouldSendShiftPublishedPushNotification(userId) {
    const { data, error } = await supabase
      .from('user_preferences')
      .select('receive_push_shift_published')
      .eq('user_id', userId)
      .single();
  
    if (error) {
      console.error('❌ Error al obtener preferencias de push shift:', error.message);
      return false; // Por seguridad: no enviar si no sabemos.
    }
  
    return data.receive_push_shift_published === true;
  }
async function shouldSendSwapRespondedPushNotification(userId) {
    const { data, error } = await supabase
      .from('user_preferences')
      .select('receive_push_swap_responded')
      .eq('user_id', userId)
      .single();
  
    if (error) {
      console.error('❌ Error al obtener preferencias de push swap responded:', error.message);
      return false; // Por seguridad: no enviar si no sabemos.
    }
  
    return data.receive_push_swap_responded === true;
  }
  async function shouldSendDailyReminderPushNotification(userId) {
    const { data, error } = await supabase
      .from('user_preferences')
      .select('receive_push_daily_reminder')
      .eq('user_id', userId)
      .single();
  
    if (error) {
      console.error('❌ Error al obtener preferencias de push daily reminder:', error.message);
      return false; // Por seguridad: no enviar si no sabemos.
    }
  
    return data.receive_push_daily_reminder === true;
  }

module.exports = {
    getUserPreferences,
    upsertUserPreferences,
    shouldSendSwapEmail,
    shouldSendReminderEmail,
    shouldSendSwapPushNotification,
    shouldSendShiftPublishedPushNotification,
    shouldSendSwapRespondedPushNotification,
    shouldSendDailyReminderPushNotification
};
