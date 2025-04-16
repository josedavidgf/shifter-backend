const express = require('express');
const router = express.Router();
const { 
    handleCreateSwap,
    handleGetReceivedSwaps,
    handleGetSentSwaps,
    handleCancelSwap,
    handleRespondToSwap,
    handleGetSwapsById,
    handleGetSwapsByShiftId,
    handleGetAcceptedSwaps,
 } = require('../controllers/swapController');
const protectRoute = require('../middlewares/authMiddleware');

router.post('/', protectRoute, handleCreateSwap);
router.get('/received', protectRoute, handleGetReceivedSwaps);
router.get('/sent', protectRoute, handleGetSentSwaps);
router.get('/accepted', protectRoute, handleGetAcceptedSwaps);
router.get('/:id', protectRoute, handleGetSwapsById);
router.patch('/:id/cancel', protectRoute, handleCancelSwap);
router.patch('/:id/respond', protectRoute, handleRespondToSwap);
router.get('/by-shift/:shiftId', protectRoute, handleGetSwapsByShiftId);


module.exports = router;
