const express = require('express');
const { registerUser, loginUser, getUserProfile, updateUserProfile, logoutUser } = require('../controllers/userController');
const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/profile', getUserProfile);
router.put('/profile', updateUserProfile);
router.post('/logout', logoutUser);

module.exports = router;
