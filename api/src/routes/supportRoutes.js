const express = require('express');
const router = express.Router();
const { sendSupportEmail } = require('../controllers/supportController');
const protectRoute = require('../middlewares/authMiddleware');

router.post('/contact', protectRoute, sendSupportEmail);

module.exports = router;
