const express = require('express');
const { 
    handleCreateShift, 
    handleGetMyShifts, 
    handleUpdateShift, 
    handleGetShiftById,
    handleRemoveShift ,
    handleGetHospitalShifts,
    handleGetShiftPreferences,
    handleUpdateShiftPreferences
} = require('../controllers/shiftController');
const protectRoute = require('../middlewares/authMiddleware');
const router = express.Router();


router.post('/', protectRoute, handleCreateShift);
router.get('/mine', protectRoute, handleGetMyShifts);
router.get('/hospital', protectRoute, handleGetHospitalShifts);
router.get('/:id', protectRoute, handleGetShiftById);
router.patch('/:id', protectRoute, handleUpdateShift);
router.patch('/:id/remove', protectRoute, handleRemoveShift);
router.get('/:id/preferences', protectRoute, handleGetShiftPreferences);
router.put('/:id/preferences', protectRoute, handleUpdateShiftPreferences);



module.exports = router;
