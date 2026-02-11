import express from 'express';
import * as authController from '../controllers/authController.js';
import authenticateToken from '../middleware/auth.js';

const router = express.Router();

// ==========================================
// Public Routes (no authentication required)
// ==========================================

// Registration & Verification
router.post('/register', authController.registerUser);
router.post('/verify-otp', authController.verifyOtp);
router.post('/resend-otp', authController.resendOtp);

// Login
router.post('/login', authController.loginUser);

// Password Reset
router.post('/send-reset-otp', authController.sendResetOtp);
router.post('/reset-password', authController.resetPassword);

// ==========================================
// Protected Routes (require authentication)
// ==========================================
router.get('/profile', authenticateToken, authController.getProfile);
router.put('/profile', authenticateToken, authController.updateProfile);

export default router;
