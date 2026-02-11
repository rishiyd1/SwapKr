import { User } from '../models/index.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import transporter from '../config/nodemailer.js';
import dotenv from 'dotenv';
dotenv.config();

// Generate 6-digit OTP
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

// ------------------ REGISTER USER ------------------
// POST /api/auth/register
export const registerUser = async (req, res) => {
    try {
        const { name, email, password, phoneNumber, department, year, hostel } = req.body;

        // Validate required fields
        if (!name || !email || !password || !phoneNumber) {
            return res.status(400).json({
                success: false,
                message: 'Name, email, password, and phone number are required'
            });
        }

        // Validate NITJ email
        if (!email.endsWith('@nitj.ac.in')) {
            return res.status(400).json({
                success: false,
                message: 'Only @nitj.ac.in emails are allowed'
            });
        }

        // Validate phone number (10 digits)
        if (!/^[0-9]{10}$/.test(phoneNumber)) {
            return res.status(400).json({
                success: false,
                message: 'Phone number must be exactly 10 digits'
            });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'Email already registered'
            });
        }

        // Check if phone number already exists
        const existingPhone = await User.findOne({ where: { phoneNumber } });
        if (existingPhone) {
            return res.status(400).json({
                success: false,
                message: 'Phone number already registered'
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Generate OTP
        const otp = generateOTP();
        const otpExpiry = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

        // Create user
        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            phoneNumber,
            department,
            year,
            hostel,
            otp,
            otpExpiresAt: otpExpiry,
            isVerified: false,
        });

        // Send OTP email
        await transporter.sendMail({
            from: process.env.SMTP_USER,
            to: email,
            subject: 'Your CampusXchange Verification Code',
            text: `Hello ${name},

Your one-time verification code (OTP) for CampusXchange is:

${otp}

This code is required to complete your registration and will expire in 5 minutes.
Please do not share this code with anyone.

If you did not request this code, please ignore this email.

Thank you,
The CampusXchange Team`,
        });

        res.status(201).json({
            success: true,
            message: 'User registered. OTP sent to your email.',
            email: user.email
        });

    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// ------------------ VERIFY OTP ------------------
// POST /api/auth/verify-otp
export const verifyOtp = async (req, res) => {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({
                success: false,
                message: 'Email and OTP are required'
            });
        }

        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Check if OTP matches
        if (!user.otp || user.otp.toString().trim() !== otp.toString().trim()) {
            return res.status(400).json({ success: false, message: 'Invalid OTP' });
        }

        // Check if OTP expired
        if (Date.now() > new Date(user.otpExpiresAt).getTime()) {
            return res.status(400).json({ success: false, message: 'OTP expired' });
        }

        // Clear OTP and mark as verified
        user.otp = null;
        user.otpExpiresAt = null;
        user.isVerified = true;
        await user.save();

        // Generate JWT token
        const token = jwt.sign(
            { id: user.id, email: user.email },
            process.env.JWT_SECRET || 'secret_key_change_me',
            { expiresIn: '7d' }
        );

        res.json({
            success: true,
            message: 'Email verified successfully!',
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                phoneNumber: user.phoneNumber,
                department: user.department,
                year: user.year,
                hostel: user.hostel,
                tokens: user.tokens,
            },
        });

    } catch (error) {
        console.error('OTP verify error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// ------------------ LOGIN USER ------------------
// POST /api/auth/login
export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email and password are required'
            });
        }

        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(400).json({
                success: false,
                message: 'User not found. Please sign up first.'
            });
        }

        if (!user.isVerified) {
            return res.status(403).json({
                success: false,
                message: 'Please verify your email via OTP before logging in.'
            });
        }

        // Compare password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({
                success: false,
                message: 'Invalid email or password.'
            });
        }

        // Generate JWT token
        const token = jwt.sign(
            { id: user.id, email: user.email },
            process.env.JWT_SECRET || 'secret_key_change_me',
            { expiresIn: '7d' }
        );

        res.status(200).json({
            success: true,
            message: 'Login successful!',
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                phoneNumber: user.phoneNumber,
                department: user.department,
                year: user.year,
                hostel: user.hostel,
                tokens: user.tokens,
            },
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

// ------------------ RESEND OTP ------------------
// POST /api/auth/resend-otp
export const resendOtp = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ success: false, message: 'Email is required' });
        }

        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        if (user.isVerified) {
            return res.status(400).json({ success: false, message: 'User already verified' });
        }

        // Generate new OTP
        const otp = generateOTP();
        const otpExpiry = new Date(Date.now() + 5 * 60 * 1000); // 5 mins

        user.otp = otp;
        user.otpExpiresAt = otpExpiry;
        await user.save();

        // Send OTP email
        await transporter.sendMail({
            from: process.env.SMTP_USER,
            to: email,
            subject: 'Your CampusXchange Verification Code (Resent)',
            text: `Hello ${user.name},

Your one-time verification code (OTP) for CampusXchange is:

${otp}

This code is valid for 5 minutes. Please do not share this code with anyone.

Thank you,
The CampusXchange Team`,
        });

        res.status(200).json({
            success: true,
            message: 'OTP resent successfully!',
        });

    } catch (error) {
        console.error('Resend OTP error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// ------------------ SEND RESET OTP ------------------
// POST /api/auth/send-reset-otp
export const sendResetOtp = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ success: false, message: 'Email is required' });
        }

        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(400).json({ success: false, message: 'User not found' });
        }

        // Generate reset OTP
        const otp = generateOTP();
        user.resetOtp = otp;
        user.resetOtpExpiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
        await user.save();

        // Send reset OTP email
        await transporter.sendMail({
            from: process.env.SMTP_USER,
            to: user.email,
            subject: 'Password Reset OTP - CampusXchange',
            text: `Hello ${user.name},

Please use the following one-time code (OTP) to reset your password:

${otp}

This code is valid for 15 minutes. For security, please do not share this code.
If you did not request a password reset, you can safely ignore this email.

Thank you,
Team CampusXchange`,
        });

        res.json({ success: true, message: 'OTP sent successfully' });

    } catch (error) {
        console.error('Send Reset OTP error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// ------------------ RESET PASSWORD ------------------
// POST /api/auth/reset-password
export const resetPassword = async (req, res) => {
    try {
        const { email, otp, newPassword } = req.body;

        if (!email || !otp || !newPassword) {
            return res.status(400).json({
                success: false,
                message: 'Email, OTP, and new password are required'
            });
        }

        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(400).json({ success: false, message: 'User not found' });
        }

        // Verify reset OTP
        if (user.resetOtp !== otp || Date.now() > new Date(user.resetOtpExpiresAt).getTime()) {
            return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
        }

        // Hash new password
        user.password = await bcrypt.hash(newPassword, 10);
        user.resetOtp = null;
        user.resetOtpExpiresAt = null;
        await user.save();

        res.json({ success: true, message: 'Password reset successfully' });

    } catch (error) {
        console.error('Reset Password error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// ------------------ GET PROFILE ------------------
// GET /api/auth/profile (protected route)
export const getProfile = async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id, {
            attributes: { exclude: ['password', 'otp', 'otpExpiresAt', 'resetOtp', 'resetOtpExpiresAt'] }
        });

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        res.status(200).json({ success: true, user });

    } catch (error) {
        console.error('Get Profile Error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// ------------------ UPDATE PROFILE ------------------
// PUT /api/auth/profile (protected route)
export const updateProfile = async (req, res) => {
    const { name, department, year, hostel, phoneNumber } = req.body;

    try {
        const user = await User.findByPk(req.user.id);

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Update fields if provided
        if (name) user.name = name;
        if (department) user.department = department;
        if (year) user.year = year;
        if (hostel) user.hostel = hostel;
        if (phoneNumber) {
            if (!/^[0-9]{10}$/.test(phoneNumber)) {
                return res.status(400).json({
                    success: false,
                    message: 'Phone number must be exactly 10 digits'
                });
            }
            user.phoneNumber = phoneNumber;
        }
        await user.save();

        res.status(200).json({
            success: true,
            message: 'Profile updated successfully',
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                phoneNumber: user.phoneNumber,
                department: user.department,
                year: user.year,
                hostel: user.hostel,
                tokens: user.tokens,
            },
        });

    } catch (error) {
        console.error('Update Profile Error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
