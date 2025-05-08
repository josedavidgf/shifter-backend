const express = require('express');
const router = express.Router();
const { getAllFlagsForUser } = require('../controllers/featureFlagController');
const protectRoute = require('../middlewares/authMiddleware');

router.get('/', protectRoute, getAllFlagsForUser);

module.exports = router;
