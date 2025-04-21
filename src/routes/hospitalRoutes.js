const express = require('express');
const router = express.Router();
const { getAllHospitals } = require('../controllers/hospitalController');
const protectRoute = require('../middlewares/authMiddleware');

router.get('/', protectRoute, getAllHospitals); // 🔐

module.exports = router;
