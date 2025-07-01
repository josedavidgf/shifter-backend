const express = require('express');
const router = express.Router();
const calendarController = require('../controllers/calendarController');

router.post('/monthly-schedules', calendarController.getMonthlySchedules);

module.exports = router; 