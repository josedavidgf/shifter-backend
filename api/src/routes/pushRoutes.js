const express = require('express');
const router = express.Router();
const { sendTestNotification } = require('../controllers/pushController');

router.get('/test/:userId', sendTestNotification);

module.exports = router;
