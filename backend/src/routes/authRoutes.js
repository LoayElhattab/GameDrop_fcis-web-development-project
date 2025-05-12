const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getHashedPassword , getUserProfile } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/hashed-password', getHashedPassword); 
router.get('/profile', protect, getUserProfile); // Protect this route

module.exports = router;