const supabase = require('../config/supabase');

async function getUserPreferences(userId) {
    const { data, error } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', userId)
        .single();
    console.log('User preferences retrieved:', data);

    if (error && error.code !== 'PGRST116') throw new Error(error.message);
    return data;
}

async function upsertUserPreferences(userId, preferences) {
    console.log('Upserting user preferences:', userId, preferences);

    const { data, error } = await supabase        
        .from('user_preferences')
        .upsert({
            user_id: userId,
            receive_emails: preferences.email_notifications, 
        })
        .select()
        .single();
    console.log('User preferences upserted:', data);
    if (error) throw new Error(error.message);
    console.log('User preferences upserted:', data);
    return data;
}

async function shouldSendEmail(userId) {
    const { data, error } = await supabase
      .from('user_preferences')
      .select('receive_emails')
      .eq('user_id', userId)
      .single();
  
    if (error) {
      console.error('❌ Error al obtener preferencias de email:', error.message);
      return false; // Por seguridad: no enviar si no sabemos.
    }
  
    return data.receive_emails === true;
  }

module.exports = {
    getUserPreferences,
    upsertUserPreferences,
    shouldSendEmail
};
