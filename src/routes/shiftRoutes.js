const express = require('express');
const { handleCreateShift, handleGetMyShifts, handleUpdateShift, handleGetShiftById } = require('../controllers/shiftController');
const protectRoute = require('../middlewares/authMiddleware');
const router = express.Router();


router.post('/', protectRoute, handleCreateShift);
router.get('/mine', protectRoute, handleGetMyShifts);
router.get('/:id', protectRoute, handleGetShiftById);
router.patch('/:id', protectRoute, handleUpdateShift);

module.exports = router;
