const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getUserProfile, createWorker } = require('../controllers/authController');

// Rutas de autenticación
router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/profile', getUserProfile);
router.post('/onboarding', createWorker);

module.exports = router;
