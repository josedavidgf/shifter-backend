const express = require('express');
const router = express.Router();
const { 
    handleCreateSwap,
    handleGetReceivedSwaps
 } = require('../controllers/swapController');
const protectRoute = require('../middlewares/authMiddleware');

router.post('/', protectRoute, handleCreateSwap);
router.get('/received', protectRoute, handleGetReceivedSwaps);

module.exports = router;
