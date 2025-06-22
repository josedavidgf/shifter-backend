const express = require('express');
const router = express.Router();
const { getCards, dismissCard } = require('../controllers/contentCardController');
const protectRoute = require('../middlewares/authMiddleware');

router.get('/', protectRoute, getCards);
router.post('/:id/dismiss', protectRoute, dismissCard);

module.exports = router;
