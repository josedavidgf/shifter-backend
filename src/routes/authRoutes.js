const express = require('express');
const router = express.Router();
const { 
    registerUser, 
    loginUser, 
    getUserProfile, 
    createWorker,
    handleResendVerification 
} = require('../controllers/authController');
const protectRoute = require('../middlewares/authMiddleware');

// Rutas de autenticación
router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/profile', getUserProfile);
router.post('/onboarding', createWorker);
router.post('/resend-verification', protectRoute, handleResendVerification);

module.exports = router;
