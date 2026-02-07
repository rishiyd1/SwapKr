const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.post('/send-otp', authController.sendVerificationOTP);
router.post('/verify-otp', authController.verifyOTPAndLogin);
router.post('/register', authController.register);

module.exports = router;
