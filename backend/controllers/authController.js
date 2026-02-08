const { User } = require('../models');
const { sendOTP, generateOTP } = require('../utils/otp');
const jwt = require('jsonwebtoken');
require('dotenv').config();

// Temporary in-memory store for OTPs (In production use Redis or DB with expiry)
// Key: email, Value: { otp, expiresAt }
const otpStore = {};

// DEV MODE: Set to true to return OTP in response (for testing without email)
const DEV_MODE = true;

// POST /api/auth/send-otp
// Send OTP to user's email for verification
exports.sendVerificationOTP = async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ message: 'Email is required' });
    }

    // Validate NITJ college email formats:
    // Format 1: firstnamelastnamefirstletter.branch.year@nitj.ac.in
    // Format 2: firstname.branch.year@nitj.ac.in
    const nitjEmailPattern = /^[a-zA-Z]+[a-zA-Z]?\.[a-zA-Z]+\.\d{2}@nitj\.ac\.in$/;

    if (!nitjEmailPattern.test(email)) {
        return res.status(400).json({
            message: 'Please login with your official NITJ email ID (@nitj.ac.in)'
        });
    }

    try {
        const otp = generateOTP();

        // Store OTP first
        otpStore[email] = {
            otp,
            expiresAt: Date.now() + 10 * 60 * 1000 // 10 minutes
        };

        // DEV MODE: Skip email sending and return OTP directly
        if (DEV_MODE) {
            console.log(`[DEV MODE] OTP for ${email}: ${otp}`);
            return res.status(200).json({
                message: 'OTP sent successfully',
                devMode: true,
                otp: otp // Only for testing! Remove in production
            });
        }

        // PRODUCTION: Send email
        const sent = await sendOTP(email, otp);
        if (sent) {
            res.status(200).json({ message: 'OTP sent successfully' });
        } else {
            delete otpStore[email]; // Clear OTP if email failed
            res.status(500).json({ message: 'Failed to send OTP' });
        }
    } catch (error) {
        console.error('Send OTP Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// POST /api/auth/verify-otp
// Verify OTP and login/check if user exists
exports.verifyOTPAndLogin = async (req, res) => {
    const { email, otp } = req.body;

    if (!email || !otp) {
        return res.status(400).json({ message: 'Email and OTP are required' });
    }

    const record = otpStore[email];
    if (!record) {
        return res.status(400).json({ message: 'OTP not requested or expired' });
    }

    if (Date.now() > record.expiresAt) {
        delete otpStore[email];
        return res.status(400).json({ message: 'OTP expired' });
    }

    if (record.otp !== otp) {
        return res.status(400).json({ message: 'Invalid OTP' });
    }

    try {
        delete otpStore[email]; // Clear OTP after verification

        let user = await User.findOne({ where: { email } });

        if (user) {
            // Existing user - generate token and login
            const token = jwt.sign(
                { id: user.id, email: user.email },
                process.env.JWT_SECRET || 'secret_key_change_me',
                { expiresIn: '7d' }
            );
            return res.status(200).json({
                message: 'Login successful',
                token,
                user,
                isNewUser: false
            });
        } else {
            // New user - OTP verified, need to complete registration
            return res.status(200).json({
                message: 'OTP verified. Please complete registration.',
                isNewUser: true,
                email
            });
        }

    } catch (error) {
        console.error('Verify OTP Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// POST /api/auth/register
// Complete registration for new users (after OTP verification)
exports.register = async (req, res) => {
    const { email, name, department, year, hostel } = req.body;

    // Validate required fields
    if (!email || !name) {
        return res.status(400).json({ message: 'Email and name are required' });
    }

    try {
        // Check if user already exists
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Create new user
        const user = await User.create({
            email,
            name,
            department,
            year,
            hostel,
            isVerified: true, // Verified via OTP
            trustScore: 50.0  // Default trust score
        });

        const token = jwt.sign(
            { id: user.id, email: user.email },
            process.env.JWT_SECRET || 'secret_key_change_me',
            { expiresIn: '7d' }
        );

        res.status(201).json({
            message: 'User registered successfully',
            user,
            token
        });

    } catch (error) {
        console.error('Register Error:', error);
        res.status(500).json({ message: 'Error registering user', error: error.message });
    }
};

// GET /api/auth/profile
// Get current user's profile (protected route)
exports.getProfile = async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id, {
            attributes: { exclude: ['trustScore'] } // Hide internal trust score
        });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({ user });
    } catch (error) {
        console.error('Get Profile Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// PUT /api/auth/profile
// Update current user's profile (protected route)
exports.updateProfile = async (req, res) => {
    const { name, department, year, hostel } = req.body;

    try {
        const user = await User.findByPk(req.user.id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Update fields if provided
        if (name) user.name = name;
        if (department) user.department = department;
        if (year) user.year = year;
        if (hostel) user.hostel = hostel;

        await user.save();

        res.status(200).json({
            message: 'Profile updated successfully',
            user
        });
    } catch (error) {
        console.error('Update Profile Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
