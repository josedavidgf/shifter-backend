const express = require('express');
const router = express.Router();
const {
  markMessagesAsReadHandler,
  getUnreadMessagesHandler,
} = require('../controllers/messagesController');
const protectRoute = require('../middlewares/authMiddleware');

router.post('/mark-as-read', protectRoute, markMessagesAsReadHandler);
router.get('/unread', protectRoute, getUnreadMessagesHandler); // 👈 nuevo endpoint

module.exports = router;
