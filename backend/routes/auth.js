const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authenticateToken = require('../middleware/auth');

// Public routes
router.post('/send-otp', authController.sendVerificationOTP);
router.post('/verify-otp', authController.verifyOTPAndLogin);
router.post('/register', authController.register);

// Protected routes (require login)
router.get('/profile', authenticateToken, authController.getProfile);
router.put('/profile', authenticateToken, authController.updateProfile);

module.exports = router;
