const express = require('express');
const router = express.Router();
const { 
    handleCreateSwap,
    handleGetReceivedSwaps,
    handleGetSentSwaps,
    handleCancelSwap,
    handleRespondToSwap
 } = require('../controllers/swapController');
const protectRoute = require('../middlewares/authMiddleware');

router.post('/', protectRoute, handleCreateSwap);
router.get('/received', protectRoute, handleGetReceivedSwaps);
router.patch('/:id/cancel', protectRoute, handleCancelSwap);
router.patch('/:id/respond', protectRoute, handleRespondToSwap);
router.get('/sent', protectRoute, handleGetSentSwaps);

module.exports = router;
