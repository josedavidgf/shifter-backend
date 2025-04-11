const express = require('express');
const { handleCreateShift } = require('../controllers/shiftController');
const protectRoute = require('../middlewares/authMiddleware');
const router = express.Router();


router.post('/', protectRoute, handleCreateShift);

module.exports = router;
