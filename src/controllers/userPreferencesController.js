const { getUserPreferences, upsertUserPreferences } = require('../services/userPreferencesService');

async function handleGetPreferences(req, res) {
  try {
    const userId = req.user.sub;
    console.log('📥 Obteniendo preferencias de usuario:', userId);
    const data = await getUserPreferences(userId);
    console.log('✅ Preferencias obtenidas:', data);
    res.json({ success: true, data });
  } catch (err) {
    console.error('❌ Error al obtener preferencias:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
}

async function handleUpdatePreferences(req, res) {
  try {
    const userId = req.user.sub;
    console.log('📤 Actualizando preferencias de usuario:', userId);
    const data = await upsertUserPreferences(userId, req.body);
    console.log('✅ Preferencias actualizadas:', data);
    res.json({ success: true, data });
  } catch (err) {
    console.error('❌ Error al actualizar preferencias:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
}

module.exports = {
  handleGetPreferences,
  handleUpdatePreferences,
};
