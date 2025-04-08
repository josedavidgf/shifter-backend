const express = require('express');
const { getWorkerTypes } = require('../controllers/workerTypeController');
const router = express.Router();

router.get('/', getWorkerTypes);

module.exports = router;
