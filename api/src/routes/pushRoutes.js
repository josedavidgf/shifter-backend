const express = require('express');
const router = express.Router();
const { registerPushToken, sendTestNotification } = require('../controllers/pushController');
const protectRoute = require('../middlewares/authMiddleware');

router.post('/register', protectRoute, registerPushToken);
router.get('/test/:userId', sendTestNotification);

module.exports = router;
