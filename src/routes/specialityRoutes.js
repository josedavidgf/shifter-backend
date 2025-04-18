const express = require('express');
const router = express.Router();
const { getAllSpecialities,getSpecialitiesByHospitalId } = require('../controllers/specialityController');
const protectRoute = require('../middlewares/authMiddleware');

router.get('/', protectRoute, getAllSpecialities);
router.get('/by-hospital/:hospitalId', protectRoute, getSpecialitiesByHospitalId);

module.exports = router;
