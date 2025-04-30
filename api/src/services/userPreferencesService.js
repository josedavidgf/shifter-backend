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

module.exports = {
    getUserPreferences,
    upsertUserPreferences,
    shouldSendSwapEmail,
    shouldSendReminderEmail
};
