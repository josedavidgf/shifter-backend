const express = require("express");
const router = express.Router();
const { 
    getEvents,
    markAsSeen
 } = require('../controllers/userEventsController');
const protectRoute = require('../middlewares/authMiddleware');

// GET /user-events
router.get('/',protectRoute, getEvents);

// POST /user-events/seen
router.post('/seen', protectRoute, markAsSeen);

module.exports = router;
