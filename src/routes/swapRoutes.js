const express = require('express');
const router = express.Router();
const { 
    handleCreateSwap,
    handleGetReceivedSwaps,
    handleUpdateSwapStatus
 } = require('../controllers/swapController');
const protectRoute = require('../middlewares/authMiddleware');

router.post('/', protectRoute, handleCreateSwap);
router.get('/received', protectRoute, handleGetReceivedSwaps);
router.patch('/:id', protectRoute, handleUpdateSwapStatus);

module.exports = router;
