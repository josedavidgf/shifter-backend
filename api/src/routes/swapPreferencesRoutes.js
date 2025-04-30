const express = require('express');
const router = express.Router();
const { handleCreateSwapPreference, handleGetMySwapPreferences, handleDeleteSwapPreference, handleExpireOldSwapPreferences } = require ('../controllers/swapPreferencesController');
const protectRoute = require('../middlewares/authMiddleware');


// Crear una nueva preferencia
router.post('/', protectRoute, handleCreateSwapPreference);

// Obtener las preferencias del usuario logueado
router.get('/', protectRoute, handleGetMySwapPreferences);

// Eliminar una preferencia
router.delete('/:preferenceId', protectRoute, handleDeleteSwapPreference);

// Eliminar preferencias antiguas
router.delete('/swap-preferences/expired', handleExpireOldSwapPreferences);


module.exports = router;
