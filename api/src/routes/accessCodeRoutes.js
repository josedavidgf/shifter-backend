const express = require('express');
const router = express.Router();
const {validateAccessCode, handleGetAccessCode} = require('../controllers/accessCodeController');

router.post('/validate', validateAccessCode);
router.get('/', handleGetAccessCode); // Permitir GET para compatibilidad con algunos clientes

module.exports = router;
