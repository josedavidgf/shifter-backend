const express = require('express');
const router = express.Router();
const { getAllSpecialities } = require('../controllers/specialityController');
const protectRoute = require('../middlewares/authMiddleware');

router.get('/', protectRoute, getAllSpecialities);

module.exports = router;
