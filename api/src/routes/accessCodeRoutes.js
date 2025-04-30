const express = require('express');
const router = express.Router();
const {validateAccessCode} = require('../controllers/accessCodeController');

router.post('/validate', validateAccessCode);

module.exports = router;
