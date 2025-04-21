const express = require('express');
const router = express.Router();
const protectRoute = require('../middlewares/authMiddleware');
const { handleGetPreferences, handleUpdatePreferences } = require('../controllers/userPreferencesController');

router.get('/', protectRoute, handleGetPreferences);
router.put('/', protectRoute, handleUpdatePreferences);

module.exports = router;