const nodemailer = require('nodemailer');
require('dotenv').config();

// Create transporter
// NOTE: For development, we are using a placeholder. 
// In production, use environment variables for SERVICE, EMAIL, and PASSWORD.
const transporter = nodemailer.createTransport({
    service: 'gmail', // or your preferred service
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

const sendOTP = async (email, otp) => {
    try {
        console.log(`DEBUG: Generated OTP for ${email} is ${otp}`); // Log OTP for testing

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'SwapKr Verification OTP',
            text: `Your OTP for SwapKr verification is: ${otp}. Do not share this with anyone.`
        };

        if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
            await transporter.sendMail(mailOptions);
            console.log(`OTP sent to ${email}`);
        } else {
            console.log('Skipping email send (no credentials). Use console OTP.');
        }

        return true; // Always return true for dev testing
    } catch (error) {
        console.error('Error sending email:', error);
        return true; // Fallback to true for testing
    }
};

const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

module.exports = { sendOTP, generateOTP };
